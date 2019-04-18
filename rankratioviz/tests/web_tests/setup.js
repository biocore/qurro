requirejs.config({
    'paths': {
        'display': '../../support_files/js/display',
        'feature_computation': '../../support_files/js/feature_computation',
        'mocha': 'vendor/mocha',
        'chai': 'vendor/chai',
        'test_compute_balance': 'tests/test_compute_balance',
        'test_identify_metadata_columns': 'tests/test_identify_metadata_columns',
        'test_make_plots': 'tests/test_make_plots'
    },
    'shim': {
        // Mocha shim based on
        // https://gist.github.com/michaelcox/3800736#gistcomment-1417093.
        // Without using this shim, the mocha module was undefined.
        'mocha': {
            'init': function() {
                mocha.setup('bdd');
                return mocha;
            }
        }
    }
});
requirejs(['display',
          'feature_computation',
          'mocha',
          'chai',
          'test_compute_balance',
          'test_identify_metadata_columns',
          'test_make_plots'],
    function(display,
             feature_computation,
             mocha,
             chai,
             test_compute_balance,
             test_identify_metadata_columns,
             test_make_plots) {
        // Enables checking for global variables created while running tests
        mocha.checkLeaks();
        // Actually run tests :D
        mocha.run();
    }
);
