require.config({

    baseUrl: '/js/lib',

    paths: {
        "app": '../app',
        "honest-lib": './honest',
        "jquery": '../../bower_components/jquery/dist/jquery',
        "modernizr": '../../bower_components/modernizr/modernizr',
        "foundation": '../../bower_components/foundation/js/foundation',
        "angular": '../../bower_components/angular/angular',
        "angular-ui-router": '../../bower_components/angular-ui-router/release/angular-ui-router',
        "angular-resource": '../../bower_components/angular-resource/angular-resource',
        "angular-recursion": '../../bower_components/angular-recursion/angular-recursion',
        "react": '../../bower_components/react/react-with-addons',
        "JSXTransformer": '../../bower_components/react/JSXTransformer',
        "angulartics": '../../bower_components/angulartics/src/angulartics',
        "angulartics-ga": '../../bower_components/angulartics/src/angulartics-ga',
        "mathjax": 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML',
        "fastclick" : '../../bower_components/fastclick/lib/fastclick',
    },

    shim: {
        "foundation": ['jquery', 'modernizr'],
        "angular-resource": ['angular'],
        "angular-ui-router": ['angular'],
        "angular": ['jquery'],
        "angulartics-ga": ["angulartics"],
        "angulartics": ["angular"],
        "angular-recursion": ["angular"],
    }
});

var app = {}

require(["app/app"]);