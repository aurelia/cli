const mockfs = require('../../mocks/mock-fs');
const PackageInstaller = require('../../../lib/build/package-installer').PackageInstaller;

describe('The PackageInstaller', () => {
  let project;
  let sut;

  describe('when there is no yarn.lock file', () => {
    beforeEach(() => {
      project = {};
      sut = new PackageInstaller(project);
      const fsConfig = {};
      mockfs(fsConfig);
    });

    afterEach(() => {
      mockfs.restore();
    });

    it('uses npm by default', () => {
      expect(sut.determinePackageManager()).toBe('npm');
    });

    it('uses npm if specified in project', () => {
      project.packageManager = 'npm';
      expect(sut.determinePackageManager()).toBe('npm');
    });

    it('uses yarn if specified in project', () => {
      project.packageManager = 'yarn';
      expect(sut.determinePackageManager()).toBe('yarn');
    });
  });

  describe('when there is yarn.lock file', () => {
    beforeEach(() => {
      project = {};
      sut = new PackageInstaller(project);
      const fsConfig = { 'yarn.lock': 'some-content'};
      mockfs(fsConfig);
    });

    afterEach(() => {
      mockfs.restore();
    });

    it('uses yarn if project did not specify, and there is yarn.lock file', () => {
      expect(sut.determinePackageManager()).toBe('yarn');
    });

    it('uses npm if specified in project, despite yarn.lock file', () => {
      project.packageManager = 'npm';
      expect(sut.determinePackageManager()).toBe('npm');
    });

    it('uses yarn if specified in project, and there is yarn.lock file', () => {
      project.packageManager = 'yarn';
      expect(sut.determinePackageManager()).toBe('yarn');
    });
  });
});
