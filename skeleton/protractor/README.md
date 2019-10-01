## Integration (e2e) tests

You need the app running for integration test.

First, run `au run` and keep it running.

Then run `au protractor`.

To perform a test-run in interactive mode, do `au protractor`.

To ask the `protractor` to start the application first and then start testing: `au protractor --headless --start`

The two following flags are useful when using `--start` flag:
 * To change dev server port, do `au protractor --start --port 8888`.
 * To change dev server host, do `au protractor --start --host 127.0.0.1`


**PS:** It is also possible to mix the flags `au protractor --headless --start --port 7070 --host 127.0.0.1`
