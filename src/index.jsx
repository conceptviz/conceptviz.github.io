/* jshint esnext:true */

/**
 * HELLO CODE-FRIEND
 * SORRY ABOUT THE CODE
 */

import React from 'react';
import ReactRouter from 'react-router';
import Radium from 'radium';
import _ from 'underscore';

const { Route, DefaultRoute, RouteHandler, Redirect, Navigation } = ReactRouter;

import appData from 'json!yaml!./data.yaml';

// given a node in a tag tree, returns a flat set of tags
var tagsFromTagTree = function(node, namePrefix, tagGroup, color) {
  var name = (namePrefix ? namePrefix + '.' : '') + node.name;
  color = node.color || color;
  var childTagLists = (node.children || []).map(child =>
    tagsFromTagTree(child, name, tagGroup, color)
  );
  var tag = {name: name, tagGroup: tagGroup, color: color};
  return [].concat.apply([tag], childTagLists);
};

var dims = {
  menuWidth: 200,
  imgWidth: 400,
  contentsWidth: 500,
  horPadding: 15,
};

var resourceWideInnerWidth = dims.imgWidth + dims.contentsWidth + dims.horPadding;
var resourceWideOuterWidth = resourceWideInnerWidth + 2 * dims.horPadding;
var resourceNarrowInnerWidth = Math.min(dims.imgWidth, dims.contentsWidth);

var cliff = (dims.menuWidth + resourceWideOuterWidth);

var foldedMediaQuery = '@media (max-width: ' + cliff + 'px)';

var linkColor = '#0066cc';
var textColor = 'rgb(100, 100, 100)';
var starColor = 'rgb(140, 140, 140)';


var decodeTags = function (tags) {
  return JSON.parse(atob(tags));
};

var encodeTags = function (tags) {
  return btoa(JSON.stringify(tags));
};


var App = React.createClass({
  mixins: [Navigation],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    var tags = this.props.params.tags;

    return {
      selectedTagsByGroup: tags ? decodeTags(tags) : {},
    };
  },

  render() {
    return (
      <div style={{fontFamily: 'trebuchet ms, arial, hevetica, sans-serif'}}>
        {this.renderLeft()}
        {this.renderRight()}
      </div>
    );
  },

  renderLeft() {
    var headingStyle = {
      fontSize: 14,
      lineHeight: '18px',
      fontWeight: 'bold',
      fontFamily: 'trebuchet ms, arial, hevetica, sans-serif',
      textTransform: 'none',
      color: '#003399',
      letterSpacing: '.1400em',
      cursor: 'pointer',

      paddingTop: 40,
    };

    var footerStyle = {
      marginTop: 20,
      fontSize: 11,
      lineHeight: '18px',
      textTransform: 'none',
      color: linkColor,
      letterSpacing: '00em',
    };

    var color1 = '#60d000';
    var color2 = '#ff9900';
    var color3 = '#339999';
    var color4 = '#990033';

    var leftMargin = 20;

    return (
      <div style={{position: 'fixed', left: leftMargin, width: dims.menuWidth - leftMargin}}>
        <div style={headingStyle} onClick={this.onHeaderClick}>GALLERY OF<br/>CONCEPT<br/>VISUALIZATION</div>
        <a href={this.makeHref('about', {tags: this.props.params.tags})} style={footerStyle}>
          about
        </a>
        {this.renderTagMenu()}
      </div>
    );
  },

  renderTagMenu() {
    var level1Style = {
      fontSize: 14,
      lineHeight: '18px',
      textTransform: 'none',
      color: '#0066cc',
      letterSpacing: '00em',
    };

    return appData.tagGroups.map(tagGroup =>
      <div key={tagGroup.name} style={{marginTop: 20, fontSize: 13.25}}>
        <div style={level1Style}>{tagGroup.name}</div>
        {tagGroup.tags.map(node =>
          <TagTreeNode
            key={node.name}
            node={node}
            tagGroup={tagGroup.name}
            color={tagGroup.color}
            selectedTags={this.state.selectedTagsByGroup[tagGroup.name] || []}
            clickable={true}
            onClickTag={this.onClickTagInTree}
          />
        )}
      </div>
    );
  },

  renderRight() {
    return (
      <div style={{marginLeft: dims.menuWidth, paddingTop: 45}}>
        <RouteHandler
          resources={this.getResourcesToDisplay()}
          onClickTagInResource={this.onClickTagInResource}
          selectedTagsByGroup={this.state.selectedTagsByGroup}
          numResources={this.getResolvedResources().length}
        />
      </div>
    );
  },

  onClickTagInTree(tagName, tagGroup) {
    var isSelected = _.contains(this.state.selectedTagsByGroup[tagGroup], tagName);
    var transformer = isSelected ? _.difference : _.union;

    var tagNames = this.getTagNames();
    var tagNamesToAddOrRemove = [tagName].concat(
      _.filter(tagNames, tag => tag.startsWith(tagName + '.'))
    );

    var newTags = React.addons.update(this.state.selectedTagsByGroup,
      {[tagGroup]:
        {$apply: selectedTags => transformer(selectedTags, tagNamesToAddOrRemove)}
      }
    );

    this.replaceWith('resources', {tags: encodeTags(newTags)});
  },

  onClickTagInResource(tagName, tagGroup) {
    var tagNames = this.getTagNames();
    var tagNamesToAddOrRemove = [tagName].concat(
      _.filter(tagNames, tag => tag.startsWith(tagName + '.'))
    );

    var newTags = {[tagGroup]: tagNamesToAddOrRemove};

    this.transitionTo('resources', {tags: encodeTags(newTags)});
  },

  getResourcesToDisplay() {
    var matchingResources = this.getResolvedResources().filter(resource =>
      _.every(this.state.selectedTagsByGroup, (selectedTags) =>
        selectedTags.length === 0 || _.some(selectedTags, tag => _.find(resource.tags, {name: tag}))
      )
    );
    return _.chain(matchingResources)
      .sortBy(resource => resource.title)
      .sortBy(resource => -(resource.stars || 0))
      .value();
  },

  getTagNames() {
    return _.pluck(this.getTags(), 'name');
  },

  getTags() {
    return _.flatten(
      appData.tagGroups.map(tagGroup =>
        tagGroup.tags.map(tag =>
          tagsFromTagTree(tag, null, tagGroup.name, tagGroup.color)
        )
      )
    );
  },

  getTagByName(name) {
    var result = _.find(this.getTags(), {name: name});
    if (!result) {
      throw `tag '${name}' not found`;
    }
    return result;
  },

  getResolvedResources() {
    var result = appData.resources.map(resource =>
      _.extend({}, resource, {tags: resource.tags.map(tag => this.getTagByName(tag))})
    );
    return result;
  },

  onHeaderClick() {
    this.transitionTo('resources', {tags: encodeTags({})});
  },

  componentWillReceiveProps(newProps) {
    var tags = newProps.params.tags;
    if (tags) {
      var decodedTags = decodeTags(tags);
      if (!_.isEqual(decodedTags, this.state.selectedTagsByGroup)) {
        this.setState({selectedTagsByGroup: decodedTags});
      }
    }
  },
});


var Resources = React.createClass({
  render() {
    var resources = this.props.resources;
    if (!resources) { return <div> WAT</div> ;}

    if (resources.length === 0) {
      return <div>No matching resources.</div>;
    } else {
      return (
        <div>
          {resources.map(resource =>
            <Resource
              key={resource.title}
              data={resource}
              onClickTag={this.props.onClickTagInResource}
              style={{marginBottom: 20}}
            />
          )}
        </div>
      );
    }
  },
});


var About = React.createClass({
  mixins: [Navigation],

  contextTypes: {
    router: React.PropTypes.func
  },

  render() {
    var linkStyle = {color: linkColor};

    return (
      <div style={{width: 500, fontSize: 14, color: 'rgb(100, 100, 100)'}}>
        <a href='#' onClick={this.onBackClick} style={linkStyle}>back</a>

        <p><b>tl;dr</b> &mdash; The <i>Gallery of Concept Visualization</i> features projects which
        use pictures to communicate complex and difficult ideas, the same way data visualizations use
        pictures to make sense of data.</p>

        <p>Please <a href='mailto:joshuah@alum.mit.edu' style={linkStyle}>send along</a> comments, questions, & contributions.

        Many thanks to:
        <ul>
        <li>everyone who made things on this list,</li>
        <li>everyone who pointed me to things on this list{' '}
          <small>(including: Toby Schachman, Michael Nagle, James Scott-Brown, James Junghanns, Donny Winston, Richard Batty)</small>,
        </li>
        <li>and <a href='http://www.radicalcartography.net/' style={linkStyle}>Bill Rankin</a>, whose elegant typography I borrowed and corrupted.</li>
        </ul>
        </p>
        <p>{this.props.numResources} resources listed. <i>Quantity Has A Quality All Its Own.</i></p>

      </div>
    );
  },

  onBackClick(e) {
    this.transitionTo('resources', {tags: encodeTags(this.props.selectedTagsByGroup || {})});
    e.preventDefault();
  },
});


var TagTreeNode = React.createClass({
  render() {
    var menuStyle = {
      marginLeft: 10
    };

    var rowStyle = {
      lineHeight: 1.8,
    };

    var color = this.props.node.color || this.props.color;
    var name = (this.props.namePrefix ? this.props.namePrefix + '.' : '') + this.props.node.name;
    var selected = this.props.selectedTags && _.contains(this.props.selectedTags, name);

    return (
      <div>
        <div style={rowStyle}>
          <Tag
            name={name}
            tagGroup={this.props.tagGroup}
            label={this.props.node.name}
            color={color}
            selected={selected}
            clickable={this.props.clickable}
            onClick={this.props.onClickTag}
          />
        </div>
        {this.props.node.children && this.props.node.children.length &&
          <div style={menuStyle}>
            {this.props.node.children.map(child =>
              <TagTreeNode
                key={child.name}
                node={child}
                tagGroup={this.props.tagGroup}
                color={color}
                namePrefix={name}
                selectedTags={this.props.selectedTags}
                clickable={this.props.clickable && !selected}
                onClickTag={this.props.onClickTag}
              />
            )}
          </div>
        }
      </div>
    );
  },
});

var Tag = React.createClass(Radium.wrap({
  getInitialState() {
    return {
      hovered: false,
    };
  },

  getDefaultProps() {
    return {
      clickable: false,
      selected: false,
    };
  },

  render() {
    var foregroundColor = this.props.selected ? 'white' : this.props.color;
    var backgroundColor = this.props.selected ? this.props.color : 'white';
    var border = this.props.selected ? 'none' : '1px solid ' + foregroundColor;

    var style = {
      display: 'inline',
      padding: '3px 5px',
      marginRight: 3,
      fontSize: 11,
      lineHeight: 1,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      verticalAlign: 'baseline',
      borderRadius: 4,

      color: foregroundColor,
      background: backgroundColor,
      border: border,
    };

    var clickableStyle = {
      cursor: 'pointer',

      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      KhtmlUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none',
    };

    var clickableHoveredStyle = {
      opacity: '0.6',
    };

    return (
      <span
        style={[
          style,
          this.props.clickable && clickableStyle,
          this.props.clickable && this.state.hovered && clickableHoveredStyle
        ]}
        onClick={this.onClick}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
        {this.props.label}
      </span>
    );
  },

  onClick(e) {
    e.stopPropagation();
    if (this.props.clickable) {
      this.props.onClick(this.props.name, this.props.tagGroup);
    }
  },

  onMouseOver() {
    this.setState({hovered: true});
  },

  onMouseOut() {
    this.setState({hovered: false});
  },
}));

var Resource = React.createClass(Radium.wrap({
  render() {
    var {title, linkUrl, imgUrl, imgFit, authors, stars, tags, blurb} = this.props.data;

    var contentsStyle = {
      display: 'inline-block',
      verticalAlign: 'top',
      color: textColor,
      fontSize: '13.25px',
      marginLeft: dims.horPadding,
      maxWidth: dims.contentsWidth,
      [foldedMediaQuery]: {
        marginTop: dims.horPadding,
        marginLeft: 0
      },
    };

    var headingStyle = {
      color: textColor,
      textDecoration: 'none',
      textTransform: 'uppercase',
      fontWeight: 'bold',
    };

    return (
      <div
        key='key'
        style={[
          {
            display: 'inline-block',
            padding: dims.horPadding,
            width: resourceWideInnerWidth,
            [foldedMediaQuery]: {
              marginRight: dims.horPadding,
              width: resourceNarrowInnerWidth,
              boxShadow: '0px 0px 40px rgba(0,0,0,0.15)',
            },
          },
          this.props.style
        ]}
      >
        <div style={{width: dims.imgWidth, display: 'inline-block', verticalAlign: 'top'}}>
          <a href={linkUrl}>
            <img src={imgUrl} style={{width: '100%', objectFit: imgFit || 'contain', height: 120}} />
          </a>
        </div>
        <div style={contentsStyle}>
          {this.renderTags()}
          <a href={linkUrl} style={{color: 'inherit', textDecoration: 'inherit'}}>
            <div style={headingStyle}>
              {title}&nbsp;
              <span style={{color: starColor}}>
                {_.range(stars || 0).map(() => '\u2605')}
              </span>
            </div>
            <div>
              {authors ? authors.join(', ') : '[unknown]'}
            </div>
            {blurb &&
              <div
                className='blurb'
                style={{marginTop: 10}}
                dangerouslySetInnerHTML={{__html: blurb}}
              />
            }
          </a>
        </div>
      </div>
    );
  },

  renderTags() {
    var {tags} = this.props.data;

    return (
      <div style={{paddingTop: 3, paddingBottom: 10}}>
        {tags.map(tag =>
          <Tag
            key={tag.name}
            name={tag.name}
            label={tag.name}
            tagGroup={tag.tagGroup}
            color={tag.color}
            selected={true}
            clickable={true}
            onClick={this.props.onClickTag}
          />
        )}
      </div>
    );
  },
}));


function RedirectTo(destination) {
  return React.createClass({
    statics: {
      willTransitionTo(transition) {
        transition.redirect(destination);
      }
    },
    render() { }
  });
}

var routes = (
  <Route path='/'>
    <DefaultRoute handler={ RedirectTo('/' + encodeTags({})) } />
    <Route handler={App} path='about'>
      <DefaultRoute name='about' handler={About} />
    </Route>
    <Route handler={App} path=':tags'>
      <DefaultRoute name='resources' handler={Resources} />
    </Route>
  </Route>
);

ReactRouter.run(routes, function (Handler, state) {
  React.render(<Handler />, document.getElementById('app-container'));
});
