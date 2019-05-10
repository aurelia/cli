const PackageInstaller = require('../../../lib/build/package-installer').PackageInstaller;
const path = require('path');

describe('The PackageInstaller', () => {
  let mockfs;
  let project;
  let sut;

  describe('when there is no yarn.lock file', () => {
    beforeEach(() => {
      mockfs = require('mock-fs');
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
      mockfs = require('mock-fs');
      project = {};
      sut = new PackageInstaller(project);
      const fsConfig = {};
      fsConfig[path.resolve(process.cwd(), 'yarn.lock')] = 'some-content';
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
