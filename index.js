'use strict';

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: key == null || typeof Symbol == 'undefined' || key.constructor !== Symbol, configurable: true, writable: true }); };

/* jshint esnext:true */

/**
 * HELLO CODE-FRIEND
 * SORRY ABOUT THE CODE
 */

var _ReactRouter = ReactRouter;
var Route = _ReactRouter.Route;
var DefaultRoute = _ReactRouter.DefaultRoute;
var RouteHandler = _ReactRouter.RouteHandler;
var Redirect = _ReactRouter.Redirect;
var Navigation = _ReactRouter.Navigation;

// given a node in a tag tree, returns a flat set of tags
var tagsFromTagTree = (function (_tagsFromTagTree) {
  function tagsFromTagTree(_x, _x2, _x3, _x4) {
    return _tagsFromTagTree.apply(this, arguments);
  }

  tagsFromTagTree.toString = function () {
    return _tagsFromTagTree.toString();
  };

  return tagsFromTagTree;
})(function (node, namePrefix, tagGroup, color) {
  var name = (namePrefix ? namePrefix + '.' : '') + node.name;
  color = node.color || color;
  var childTagLists = (node.children || []).map(function (child) {
    return tagsFromTagTree(child, name, tagGroup, color);
  });
  var tag = { name: name, tagGroup: tagGroup, color: color };
  return [].concat.apply([tag], childTagLists);
});

var dims = {
  menuWidth: 200,
  imgWidth: 400,
  contentsWidth: 500,
  horPadding: 15 };

var resourceWideInnerWidth = dims.imgWidth + dims.contentsWidth + dims.horPadding;
var resourceWideOuterWidth = resourceWideInnerWidth + 2 * dims.horPadding;
var resourceNarrowInnerWidth = Math.min(dims.imgWidth, dims.contentsWidth);

var cliff = dims.menuWidth + resourceWideOuterWidth;

var foldedMediaQuery = '@media (max-width: ' + cliff + 'px)';

var linkColor = '#0066cc';
var textColor = 'rgb(100, 100, 100)';
var starColor = 'rgb(140, 140, 140)';

var decodeTags = function decodeTags(tags) {
  return JSON.parse(atob(tags));
};

var encodeTags = function encodeTags(tags) {
  return btoa(JSON.stringify(tags));
};

var App = React.createClass({
  displayName: 'App',

  mixins: [Navigation],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function getInitialState() {
    var tags = this.props.params.tags;

    return {
      data: null,
      selectedTagsByGroup: tags ? decodeTags(tags) : {} };
  },

  render: function render() {
    return React.createElement(
      'div',
      { style: { fontFamily: 'trebuchet ms, arial, hevetica, sans-serif' } },
      this.renderLeft(),
      this.renderRight()
    );
  },

  renderLeft: function renderLeft() {
    var headingStyle = {
      fontSize: 14,
      lineHeight: '18px',
      fontWeight: 'bold',
      fontFamily: 'trebuchet ms, arial, hevetica, sans-serif',
      textTransform: 'none',
      color: '#003399',
      letterSpacing: '.1400em',
      cursor: 'pointer',

      paddingTop: 40 };

    var footerStyle = {
      marginTop: 20,
      fontSize: 11,
      lineHeight: '18px',
      textTransform: 'none',
      color: linkColor,
      letterSpacing: '00em' };

    var color1 = '#60d000';
    var color2 = '#ff9900';
    var color3 = '#339999';
    var color4 = '#990033';

    var leftMargin = 20;

    return React.createElement(
      'div',
      { style: { position: 'fixed', left: leftMargin, width: dims.menuWidth - leftMargin } },
      React.createElement(
        'div',
        { style: headingStyle, onClick: this.onHeaderClick },
        'GALLERY OF',
        React.createElement('br', null),
        'CONCEPT',
        React.createElement('br', null),
        'VISUALIZATION'
      ),
      React.createElement(
        'a',
        { href: this.makeHref('about', { tags: this.props.params.tags }), style: footerStyle },
        'about'
      ),
      this.renderTagMenu()
    );
  },

  renderTagMenu: function renderTagMenu() {
    var _this = this;

    var level1Style = {
      fontSize: 14,
      lineHeight: '18px',
      textTransform: 'none',
      color: '#0066cc',
      letterSpacing: '00em' };

    return this.state.data && this.state.data.tagGroups.map(function (tagGroup) {
      return React.createElement(
        'div',
        { key: tagGroup.name, style: { marginTop: 20, fontSize: 13.25 } },
        React.createElement(
          'div',
          { style: level1Style },
          tagGroup.name
        ),
        tagGroup.tags.map(function (node) {
          return React.createElement(TagTreeNode, {
            key: node.name,
            node: node,
            tagGroup: tagGroup.name,
            color: tagGroup.color,
            selectedTags: _this.state.selectedTagsByGroup[tagGroup.name] || [],
            clickable: true,
            onClickTag: _this.onClickTagInTree
          });
        })
      );
    });
  },

  renderRight: function renderRight() {
    return React.createElement(
      'div',
      { style: { marginLeft: dims.menuWidth, paddingTop: 45 } },
      React.createElement(RouteHandler, {
        resources: this.getResourcesToDisplay(),
        hasData: !!this.state.data,
        onClickTagInResource: this.onClickTagInResource,
        selectedTagsByGroup: this.state.selectedTagsByGroup
      })
    );
  },

  onClickTagInTree: function onClickTagInTree(tagName, tagGroup) {
    var isSelected = _(this.state.selectedTagsByGroup[tagGroup]).contains(tagName);
    var transformer = isSelected ? _.difference : _.union;

    var tagNames = this.getTagNames();
    var tagNamesToAddOrRemove = [tagName].concat(_(tagNames).filter(function (tag) {
      return tag.startsWith(tagName + '.');
    }));

    var newTags = React.addons.update(this.state.selectedTagsByGroup, _defineProperty({}, tagGroup, { $apply: function $apply(selectedTags) {
        return transformer(selectedTags, tagNamesToAddOrRemove);
      } }));

    this.replaceWith('resources', { tags: encodeTags(newTags) });
  },

  onClickTagInResource: function onClickTagInResource(tagName, tagGroup) {
    var tagNames = this.getTagNames();
    var tagNamesToAddOrRemove = [tagName].concat(_(tagNames).filter(function (tag) {
      return tag.startsWith(tagName + '.');
    }));

    var newTags = _defineProperty({}, tagGroup, tagNamesToAddOrRemove);

    this.transitionTo('resources', { tags: encodeTags(newTags) });
  },

  getResourcesToDisplay: function getResourcesToDisplay() {
    var _this2 = this;

    var matchingResources = this.getResolvedResources().filter(function (resource) {
      return _(_this2.state.selectedTagsByGroup).every(function (selectedTags) {
        return selectedTags.length === 0 || _(selectedTags).some(function (tag) {
          return _(resource.tags).findWhere({ name: tag });
        });
      });
    });
    return _(matchingResources).chain().sortBy(function (resource) {
      return resource.title;
    }).sortBy(function (resource) {
      return -(resource.stars || 0);
    }).value();
  },

  getTagNames: function getTagNames() {
    return _(this.getTags()).pluck('name');
  },

  getTags: function getTags() {
    return _.flatten(this.state.data.tagGroups.map(function (tagGroup) {
      return tagGroup.tags.map(function (tag) {
        return tagsFromTagTree(tag, null, tagGroup.name, tagGroup.color);
      });
    }));
  },

  getTagByName: function getTagByName(name) {
    var result = _(this.getTags()).findWhere({ name: name });
    if (!result) {
      throw 'tag \'' + name + '\' not found';
    }
    return result;
  },

  getResolvedResources: function getResolvedResources() {
    var _this3 = this;

    if (this.state.data) {
      var result = this.state.data.resources.map(function (resource) {
        return _.extend({}, resource, { tags: resource.tags.map(function (tag) {
            return _this3.getTagByName(tag);
          }) });
      });
      return result;
    } else {
      return [];
    }
  },

  onHeaderClick: function onHeaderClick() {
    this.transitionTo('resources', { tags: encodeTags({}) });
  },

  componentDidMount: function componentDidMount() {
    var _this4 = this;

    var request = new XMLHttpRequest();
    request.open('GET', 'data.json', true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        _this4.setState({ data: data });
      } else {}
    };

    request.onerror = function () {};

    request.send();
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    var tags = newProps.params.tags;
    if (tags) {
      var decodedTags = decodeTags(tags);
      if (!_.isEqual(decodedTags, this.state.selectedTagsByGroup)) {
        this.setState({ selectedTagsByGroup: decodedTags });
      }
    }
  } });

var Resources = React.createClass({
  displayName: 'Resources',

  render: function render() {
    var _this5 = this;

    var hasData = this.props.hasData;
    var resources = this.props.resources;
    if (!resources) {
      return React.createElement(
        'div',
        null,
        ' WAT'
      );
    }

    if (hasData && resources.length === 0) {
      return React.createElement(
        'div',
        null,
        'No matching resources.'
      );
    } else {
      return React.createElement(
        'div',
        null,
        resources.map(function (resource) {
          return React.createElement(Resource, {
            key: resource.title,
            data: resource,
            onClickTag: _this5.props.onClickTagInResource,
            style: { marginBottom: 20 }
          });
        })
      );
    }
  } });

var About = React.createClass({
  displayName: 'About',

  mixins: [Navigation],

  contextTypes: {
    router: React.PropTypes.func
  },

  render: function render() {
    var linkStyle = { color: linkColor };

    return React.createElement(
      'div',
      { style: { width: 500, fontSize: 14, color: 'rgb(100, 100, 100)' } },
      React.createElement(
        'a',
        { href: '#', onClick: this.onBackClick, style: linkStyle },
        'back'
      ),
      React.createElement(
        'p',
        null,
        React.createElement(
          'b',
          null,
          'tl;dr'
        ),
        ' — The ',
        React.createElement(
          'i',
          null,
          'Gallery of Concept Visualization'
        ),
        ' features projects which use pictures to communicate complex and difficult ideas, the same way data visualizations use pictures to make sense of data.'
      ),
      React.createElement(
        'p',
        null,
        'Please ',
        React.createElement(
          'a',
          { href: 'mailto:joshuah@alum.mit.edu', style: linkStyle },
          'send along'
        ),
        ' comments, questions, & contributions. Many thanks to:',
        React.createElement(
          'ul',
          null,
          React.createElement(
            'li',
            null,
            'everyone who made things on this list,'
          ),
          React.createElement(
            'li',
            null,
            'everyone who pointed me to things on this list',
            ' ',
            React.createElement(
              'small',
              null,
              '(including: Toby Schachman, Michael Nagle, James Scott-Brown, James Junghanns, Donny Winston, Richard Batty)'
            ),
            ','
          ),
          React.createElement(
            'li',
            null,
            'and ',
            React.createElement(
              'a',
              { href: 'http://www.radicalcartography.net/', style: linkStyle },
              'Bill Rankin'
            ),
            ', whose elegant typography I borrowed and corrupted.'
          )
        )
      )
    );
  },

  onBackClick: function onBackClick(e) {
    this.transitionTo('resources', { tags: encodeTags(this.props.selectedTagsByGroup || {}) });
    e.preventDefault();
  } });

var TagTreeNode = React.createClass({
  displayName: 'TagTreeNode',

  render: function render() {
    var _this6 = this;

    var menuStyle = {
      marginLeft: 10
    };

    var rowStyle = {
      lineHeight: 1.8 };

    var color = this.props.node.color || this.props.color;
    var name = (this.props.namePrefix ? this.props.namePrefix + '.' : '') + this.props.node.name;
    var selected = this.props.selectedTags && _(this.props.selectedTags).contains(name);

    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { style: rowStyle },
        React.createElement(Tag, {
          name: name,
          tagGroup: this.props.tagGroup,
          label: this.props.node.name,
          color: color,
          selected: selected,
          clickable: this.props.clickable,
          onClick: this.props.onClickTag
        })
      ),
      this.props.node.children && this.props.node.children.length && React.createElement(
        'div',
        { style: menuStyle },
        this.props.node.children.map(function (child) {
          return React.createElement(TagTreeNode, {
            key: child.name,
            node: child,
            tagGroup: _this6.props.tagGroup,
            color: color,
            namePrefix: name,
            selectedTags: _this6.props.selectedTags,
            clickable: _this6.props.clickable && !selected,
            onClickTag: _this6.props.onClickTag
          });
        })
      )
    );
  } });

var Tag = React.createClass(Radium.wrap({
  getInitialState: function getInitialState() {
    return {
      hovered: false };
  },

  getDefaultProps: function getDefaultProps() {
    return {
      clickable: false,
      selected: false };
  },

  render: function render() {
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
      border: border };

    var clickableStyle = {
      cursor: 'pointer',

      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      KhtmlUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none' };

    var clickableHoveredStyle = {
      opacity: '0.6' };

    return React.createElement(
      'span',
      {
        style: [style, this.props.clickable && clickableStyle, this.props.clickable && this.state.hovered && clickableHoveredStyle],
        onClick: this.onClick,
        onMouseOver: this.onMouseOver,
        onMouseOut: this.onMouseOut
      },
      this.props.label
    );
  },

  onClick: function onClick(e) {
    e.stopPropagation();
    if (this.props.clickable) {
      this.props.onClick(this.props.name, this.props.tagGroup);
    }
  },

  onMouseOver: function onMouseOver() {
    this.setState({ hovered: true });
  },

  onMouseOut: function onMouseOut() {
    this.setState({ hovered: false });
  } }));

var Resource = React.createClass(Radium.wrap({
  render: function render() {
    var _props$data = this.props.data;
    var title = _props$data.title;
    var linkUrl = _props$data.linkUrl;
    var imgUrl = _props$data.imgUrl;
    var imgFit = _props$data.imgFit;
    var authors = _props$data.authors;
    var stars = _props$data.stars;
    var tags = _props$data.tags;
    var blurb = _props$data.blurb;

    var contentsStyle = _defineProperty({
      display: 'inline-block',
      verticalAlign: 'top',
      color: textColor,
      fontSize: '13.25px',
      marginLeft: dims.horPadding,
      maxWidth: dims.contentsWidth }, foldedMediaQuery, {
      marginTop: dims.horPadding,
      marginLeft: 0
    });

    var headingStyle = {
      color: textColor,
      textDecoration: 'none',
      textTransform: 'uppercase',
      fontWeight: 'bold' };

    return React.createElement(
      'div',
      {
        key: 'key',
        style: [_defineProperty({
          display: 'inline-block',
          padding: dims.horPadding,
          width: resourceWideInnerWidth }, foldedMediaQuery, {
          marginRight: dims.horPadding,
          width: resourceNarrowInnerWidth,
          boxShadow: '0px 0px 40px rgba(0,0,0,0.15)' }), this.props.style]
      },
      React.createElement(
        'div',
        { style: { width: dims.imgWidth, display: 'inline-block', verticalAlign: 'top' } },
        React.createElement(
          'a',
          { href: linkUrl },
          React.createElement('img', { src: imgUrl, style: { width: '100%', objectFit: imgFit || 'contain', height: 120 } })
        )
      ),
      React.createElement(
        'div',
        { style: contentsStyle },
        this.renderTags(),
        React.createElement(
          'a',
          { href: linkUrl, style: { color: 'inherit', textDecoration: 'inherit' } },
          React.createElement(
            'div',
            { style: headingStyle },
            title,
            ' ',
            React.createElement(
              'span',
              { style: { color: starColor } },
              _.range(stars || 0).map(function () {
                return '★';
              })
            )
          ),
          React.createElement(
            'div',
            null,
            authors ? authors.join(', ') : '[unknown]'
          ),
          blurb && React.createElement('div', {
            className: 'blurb',
            style: { marginTop: 10 },
            dangerouslySetInnerHTML: { __html: blurb }
          })
        )
      )
    );
  },

  renderTags: function renderTags() {
    var _this7 = this;

    var tags = this.props.data.tags;

    return React.createElement(
      'div',
      { style: { paddingTop: 3, paddingBottom: 10 } },
      tags.map(function (tag) {
        return React.createElement(Tag, {
          key: tag.name,
          name: tag.name,
          label: tag.name,
          tagGroup: tag.tagGroup,
          color: tag.color,
          selected: true,
          clickable: true,
          onClick: _this7.props.onClickTag
        });
      })
    );
  } }));

function RedirectTo(destination) {
  return React.createClass({
    statics: {
      willTransitionTo: function willTransitionTo(transition) {
        transition.redirect(destination);
      }
    },
    render: function render() {}
  });
}

var routes = React.createElement(
  Route,
  { path: '/' },
  React.createElement(DefaultRoute, { handler: RedirectTo('/' + encodeTags({})) }),
  React.createElement(
    Route,
    { handler: App, path: 'about' },
    React.createElement(DefaultRoute, { name: 'about', handler: About })
  ),
  React.createElement(
    Route,
    { handler: App, path: ':tags' },
    React.createElement(DefaultRoute, { name: 'resources', handler: Resources })
  )
);

ReactRouter.run(routes, function (Handler, state) {
  React.render(React.createElement(Handler, null), document.getElementById('app-container'));
});

// server error

// connection error
