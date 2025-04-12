//Configure Bluebird Promises.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Promise as any).config({
  longStackTraces: false,
  warnings: {
    wForgottenReturn: false
  }
});
