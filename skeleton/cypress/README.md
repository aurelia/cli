## Integration (e2e) tests

You need the app running for integration test.

First, run `au run` and keep it running.

Then run `au cypress` to run cypress in interactive mode.

To perform a test-run and reports the results, do `au cypress --run`.

To ask the `cypress` to start the application first and then start testing: `au cypress --run --start`

The two following flags are useful when using `--start` flag:
 * To change dev server port, do `au cypress --start --port 8888`.
 * To change dev server host, do `au cypress --start --host 127.0.0.1`


**PS:** It is also possible to mix the flags `au cypress --run --start --port 7070 --host 127.0.0.1`
