const path = require('path');
const fs = require('../../lib/file-system');
const mockfs = require('mock-fs');
const {ProjectItem} = require('../../lib/project-item');

describe('The ProjectItem module', () => {
  it('ProjectItem.text() captures text', () => {
    const t = ProjectItem.text('file.js', 'lorem');
    expect(t.name).toBe('file.js');
    expect(t.text).toBe('lorem');
    expect(t.isDirectory).toBe(false);
    expect(() => t.add(ProjectItem.text('file2.js', 'lorem'))).toThrow();
  });

  it('ProjectItem.directory() captures dir', () => {
    const t = ProjectItem.directory('dir');
    expect(t.name).toBe('dir');
    expect(t.text).toBeUndefined();
    expect(t.isDirectory).toBe(true);
    const file = ProjectItem.text('file.js', 'lorem');
    const folder = ProjectItem.directory('folder');
    t.add(file).add(folder);
    expect(t.children.length).toBe(2);
    expect(t.children).toEqual([file, folder]);
  });

  describe('Creates files', () => {
    let folder;
    beforeEach(() => {
      mockfs();
      folder = ProjectItem.directory('folder');
      folder.add(ProjectItem.text('file1.js', 'file1'));
      folder.add(ProjectItem.text('file2.js', 'file2'));
      folder.add(ProjectItem.directory('deepFolder').add(ProjectItem.text('file4.js', 'file4')));
    });

    afterEach(() => {
      mockfs.restore();
    });

    it('creates deep folders and files', async() => {
      await folder.create('root');
      expect(fs.readdirSync('.')).toEqual(['folder']);
      expect(fs.readdirSync('folder').sort()).toEqual(['deepFolder', 'file1.js', 'file2.js']);
      expect(fs.readFileSync(path.join('folder', 'file1.js'))).toBe('file1');
      expect(fs.readFileSync(path.join('folder', 'file2.js'))).toBe('file2');
      expect(fs.readdirSync(path.join('folder', 'deepFolder')).sort()).toEqual(['file4.js']);
      expect(fs.readFileSync(path.join('folder', 'deepFolder', 'file4.js'))).toBe('file4');
    });

    it('Overwrites existing file', async() => {
      mockfs({
        'folder': {
          'file1.js': 'oldfile1',
          'file3.js': 'oldfile3'
        }
      });
      await folder.create('root');
      expect(fs.readdirSync('.')).toEqual(['folder']);
      expect(fs.readdirSync('folder').sort()).toEqual(['deepFolder', 'file1.js', 'file2.js', 'file3.js']);
      expect(fs.readFileSync(path.join('folder', 'file1.js'))).toBe('file1');
      expect(fs.readFileSync(path.join('folder', 'file2.js'))).toBe('file2');
      expect(fs.readFileSync(path.join('folder', 'file3.js'))).toBe('oldfile3');
      expect(fs.readdirSync(path.join('folder', 'deepFolder')).sort()).toEqual(['file4.js']);
      expect(fs.readFileSync(path.join('folder', 'deepFolder', 'file4.js'))).toBe('file4');
    });
  });
});
