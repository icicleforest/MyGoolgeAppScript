var FileSystem = FileSystem || {};

//===========================================================

FileSystem.ItemType = Object.freeze({
  "File": 1,
  "Folder": 2,
  "Directory": 2 // Alias of Folder
});


FileSystem.RuntimeException = Object.freeze({
  "ItemAlreadyExists": "Item already exists.",
  "ItemDoseNotExist": "Item dosen't exists.",
  "InvalidArgument": "Argument is invalid.",
  "NotImplemented": "Function is not implemented.",
  "Unknown": "Unknown error has occurred."
});

//===========================================================

FileSystem.FOLDER_SEPARATOR_CHAR = "/";


FileSystem.CURRENT_SPREADSHEET = SpreadsheetApp.getActive();


FileSystem.ROOT_FOLDER = (function () {
  var iter = DriveApp.getFileById(FileSystem.CURRENT_SPREADSHEET.getId()).getParents();
  var folder = null;
  while (iter.hasNext()) {
    folder = iter.next();
  }
  return folder;
})();


FileSystem.CurrentWorkingFolder = FileSystem.ROOT_FOLDER;
FileSystem.CurrentWorkingFolderPath = FileSystem.FOLDER_SEPARATOR_CHAR;

//===========================================================

FileSystem._testAbsolutePath = function (path) {
  var re = new RegExp('^' + this.FOLDER_SEPARATOR_CHAR);
  return path.match(re) ? true : false;
};


FileSystem._normalizePath = function (path) {
  var names = path.split(this.FOLDER_SEPARATOR_CHAR);
  var pos = 0;
  var bufNames = [];
  if (this._testAbsolutePath(path)) {
    for (var i = 1; i < names.length; ++i) {
      switch (names[i]) {
        case "..":
          if (pos > 0) {
            --pos;
            bufNames.pop();
          }
          break;
        case ".":
          break;
        case "":
          break;
        default:
          ++pos;
          bufNames.push(names[i]);
          break;
      }
    }
    bufNames.unshift("");
    return bufNames.join(this.FOLDER_SEPARATOR_CHAR);
  }
  else {
    for (var i = 0; i < names.length; ++i) {
      switch (names[i]) {
        case "..":
          if (pos > 0) {
            bufNames.pop();
            --pos;
          }
          else {
            bufNames.unshift("..");
          }
          break;
        case ".":
          break;
        case "":
          break;
        default:
          ++pos;
          bufNames.push(names[i]);
          break;
      }
    }
    return bufNames.join(this.FOLDER_SEPARATOR_CHAR);
  }
};


FileSystem._getChildItem = function (idParentFolder, nameChild, typeItem) {
  typeItem = !(typeItem) ? this.ItemType.File : typeItem;

  var folderParent = DriveApp.getFolderById(idParentFolder);
  var child = null;
  var iter = null;

  switch (typeItem) {
    case this.ItemType.Folder:
      iter = folderParent.getFoldersByName(nameChild);
      break;
    case this.ItemType.File:
      iter = folderParent.getFilesByName(nameChild);
      break;
  }

  while (iter.hasNext()) {
    child = iter.next();
  }

  return child;
};


FileSystem._getParentItem = function (idChild) {
  var iter = DriveApp.getFileById(idChild).getParents();
  var folder = null;
  while (iter.hasNext()) {
    folder = iter.next();
  }
  return folder;
};


FileSystem._newChildItem = function (idParentFolder, nameChild, typeItem, duplicate) {
  typeItem = !(typeItem) ? this.ItemType.File : typeItem;
  duplicate = !(duplicate) ? false : duplicate;

  var itemChild = this._getChildItem(idParentFolder, nameChild, typeItem);
  if (itemChild && !duplicate) {
    throw FileSystem.RuntimeException.ItemAlreadyExists;
    //return itemChild;
  }

  var folderParent = DriveApp.getFolderById(idParentFolder);
  switch (typeItem) {
    case this.ItemType.Folder:
      itemChild = folderParent.createFolder(nameChild);
      break;
    case this.ItemType.File:
      itemChild = folderParent.createFile(nameChild, "");
      break;
  }

  return itemChild;
};


FileSystem._deleteChildItem = function (idParentFolder, nameChild, typeItem, completely) {
  typeItem = !(typeItem) ? this.ItemType.File : typeItem;
  completely = !(completely) ? false : completely;

  var itemChild = this._getChildItem(idParentFolder, nameChild, typeItem);
  if (itemChild == null) {
    return null;
  }

  if (!completely) {
    var folderParent = DriveApp.getFolderById(idParentFolder);
    switch (typeItem) {
      case this.ItemType.Folder:
        itemChild = folderParent.removeFolder(itemChild);
        break;
      case this.ItemType.File:
        itemChild = folderParent.removeFile(itemChild);
        break;
    }
  }
  else {
    Drive.Files.remove(itemChild.getId());
    itemChild = DriveApp.getFolderById(idParentFolder);
  }

  return itemChild;
};

//===========================================================

FileSystem.changeRoot = function (path) {
  var folder = FileSystem.getItem(path, FileSystem.ItemType.Folder);
  if (folder) {
    this.ROOT_FOLDER = folder;
    this.CurrentWorkingFolder = folder;
    this.CurrentWorkingFolderPath = this.FOLDER_SEPARATOR_CHAR;
  }
  else {
    throw FileSystem.RuntimeException.ItemDoseNotExist;
  }
};


FileSystem.changeWorkingFolder = function (path) {
  var folder = FileSystem.getItem(path, FileSystem.ItemType.Folder);
  if (folder) {
    this.CurrentWorkingFolder = folder;
    this.CurrentWorkingFolderPath = this._normalizePath(this._testAbsolutePath(path) ? path : (this.joinPath(this.CurrentWorkingFolderPath, path)));
  }
  else {
    throw FileSystem.RuntimeException.ItemDoseNotExist;
  }
};


FileSystem.joinPath = function (path, name) {
  var pathTemp = path;

  // 末尾にFOLDER_SEPARATOR_CHARがあったら取り除く
  var re = new RegExp(this.FOLDER_SEPARATOR_CHAR + '+$');
  pathTemp = pathTemp.replace(re, "");

  // "FOLDER_SEPARATOR_CHAR + name"を付加する
  pathTemp = pathTemp + this.FOLDER_SEPARATOR_CHAR + name;

  // パスの正規化  
  pathTemp = this._normalizePath(pathTemp);

  return pathTemp;
};


FileSystem.testPath = function (path) {
  try {
    FileSystem.getItem(path);
    return true;
  }
  catch (e) {
    return false;
  }
};


FileSystem.splitPath = function (path, leaf, removeExt) {
  leaf = !(leaf) ? false : leaf;
  removeExt = !(removeExt) ? false : true;
  var names = path.split(this.FOLDER_SEPARATOR_CHAR);
  if (leaf) {
    return (removeExt) ? names[names.length - 1].replace(/\.[^.]+$/, "") : names[names.length - 1];
  }
  else {
    var arr = names.slice(0, names.length - 1);
    if (arr.length == 1 && arr[0] == "") {
      return this.FOLDER_SEPARATOR_CHAR;
    }
    else {
      return arr.join(this.FOLDER_SEPARATOR_CHAR);
    }
  }
};


FileSystem.getItem = function (path, typeItem) {
  var specified = !(typeItem == null);
  typeItem = !(typeItem) ? this.ItemType.File : typeItem;

  var names = path.split(this.FOLDER_SEPARATOR_CHAR);

  var continued = true;
  while (continued) {
    continued = false;
    if (names[names.length - 1] == "") {
      names.pop();
      continued = true;
    }
  }

  var id = FileSystem._testAbsolutePath(path) ? this.ROOT_FOLDER.getId() : this.CurrentWorkingFolder.getId();
  var failed = false;
  var obj = FileSystem._testAbsolutePath(path) ? this.ROOT_FOLDER : null;
  for (var i = FileSystem._testAbsolutePath(path) ? 1 : 0; i < names.length; ++i) {
    switch (names[i]) {
      case "..":
        obj = (id == this.ROOT_FOLDER.getId()) ? this.ROOT_FOLDER : FileSystem._getParentItem(id); // Anti-directory-traversal
        break;
      case ".":
        obj = DriveApp.getFolderById(id);
        break;
      case "":
        obj = DriveApp.getFolderById(id);
        break;
      default:
        if (i < names.length - 1) {
          obj = FileSystem._getChildItem(id, names[i], this.ItemType.Folder);
        }
        else {
          if (specified) {
            obj = FileSystem._getChildItem(id, names[names.length - 1], typeItem);
          }
          else {
            obj = FileSystem._getChildItem(id, names[names.length - 1], this.ItemType.File);
            if (!obj) {
              obj = FileSystem._getChildItem(id, names[names.length - 1], this.ItemType.Folder);
            }
          }
        }
        break;
    }

    if (obj) {
      id = obj.getId();
      continue;
    }
    else {
      throw FileSystem.RuntimeException.ItemDoseNotExist;
      break;
    }
  }

  return obj;
};


//FileSystem.setItem = function(path) {
//};


FileSystem.newItem = function (path, typeItem, withParent) {
  Logger.log(path);
  typeItem = !(typeItem) ? this.ItemType.File : typeItem;
  withParent = !(withParent) ? false : withParent;

  var pathParentFolder = this.splitPath(path);
  Logger.log(" Parent ; " + pathParentFolder);
  if (!this.testPath(pathParentFolder)) {
    if (withParent) {
      this.newItem(pathParentFolder, this.ItemType.Folder, withParent);
    }
    else {
      throw this.RuntimeException.ItemDoseNotExist;
    }
  }

  var folderParent = this.getItem(pathParentFolder, this.ItemType.Folder);
  var nameChild = this.splitPath(path, true);

  return this._newChildItem(folderParent.getId(), nameChild, typeItem, false);
};


FileSystem.deleteItem = function (path, typeItem, completely) {
  typeItem = !(typeItem) ? this.ItemType.File : typeItem;
  completely = !(completely) ? false : true;

  var item = this.getItem(path, typeItem);
  if (!item) {
    throw this.RuntimeException.ItemDoseNotExist;
  }

  var itemParent = this._getParentItem(item.getId());
  return this._deleteChildItem(itemParent.getId(), this.splitPath(path, true), typeItem, completely);
};
