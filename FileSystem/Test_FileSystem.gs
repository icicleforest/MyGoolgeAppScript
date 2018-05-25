var console = {};
console.log = function(message) { Logger.log(message); }


function test_FileSystem_buildPath() {
  var p1 = "/path/to/somedir";
  var c1 = "a";
  var a1 = FileSystem.buildPath(p1, c1);
  console.log("\"" + p1 + "\" + \"" + c1 + "\" => \"" + a1 +"\"");
  
  var p2 = "/path/to/somedir/";
  var c2 = "b";
  var a2 = FileSystem.buildPath(p2, c2);
  console.log("\"" + p2 + "\" + \"" + c2 + "\" => \"" + a2 +"\"");
}


function test_FileSystem__testAbsoultePath() {
  var p1 = "/a/b/c";
  console.log(FileSystem._testAbsolutePath(p1));
  
  var p2 = "../a/b";
  console.log(FileSystem._testAbsolutePath(p2));
}


function test_FileSystem__normalizePath() {
  var pathes = [
    "/path/to/somedir",
    "/path//to/somedir",
    "/path/./to/somedir",
    "/path/../to/somedir",
    "/path/../../../../to/../../somedir",
    "/path/./././/./../../../somedir/../../a",
    "path/to/somedir",
    "path/../to/somedir",
    "path/../../../to/../../somedir",
    "path/././././to/somedir/../a"
  ];
  
  for(var i = 0; i < pathes.length; ++i) {
    console.log("\"" + pathes[i] + "\" => " + FileSystem._normalizePath(pathes[i]) + "");
  }
}


function test_FileSystem__getChildItem() {
  var idRoot = FileSystem.ROOT_FOLDER.getId();
  console.log(DriveApp.getFolderById(idRoot).getName());
  
  var folderTestFolder1 = FileSystem._getChildItem(idRoot, "TestFolder1", FileSystem.ItemType.Folder);
  console.log("\"TestFolder1\" => " + folderTestFolder1.getName());
  
  var folderTestFolder11 = FileSystem._getChildItem(folderTestFolder1.getId(), "TestFolder11", FileSystem.ItemType.Folder);
  console.log("\"TestFolder1/TestFolder11\" => " + folderTestFolder11.getName());
}


function test_FileSystem_getItem() {
  var idRoot = FileSystem.ROOT_FOLDER.getId();
  
  var pathes = [
    "/TestFolder1/TestFolder11",
    "/TestFolder1/TestFolder11/TestFile111",
    "/TestFolder1/TestFolder11/./TestFile111",
    "/TestFolder1/TestFolder11/../TestFolder11/TestFile111",
    "/TestFolder1/TestFolder11/../../../../../TestFolder1/TestFolder11/TestFile111"
  ];
  
  for(var i = 0; i < pathes.length; ++i) {
    var f = FileSystem.getItem(pathes[i]);
    console.log("\"" + pathes[i] + "\" => " + f.getName());
  }
}


function test_FileSystem_splitPath() {
  var apath = "/path/to/somepath.a";
  var rpath = "path/to/somepath.bbb";
  
  console.log(FileSystem.splitPath(apath));
  console.log(FileSystem.splitPath(apath, true));
  console.log(FileSystem.splitPath(apath, true, true));
  
  console.log(FileSystem.splitPath(rpath));
  console.log(FileSystem.splitPath(rpath, true));
  console.log(FileSystem.splitPath(rpath, true, true));
}


function test_FileSystem_changeRoot() {
  FileSystem.changeRoot("/Content");
  var file = FileSystem.getItem("/Index.md");
  console.log(file.getName());
}


function test_FileSystem_changeWorkingFolder() {
  FileSystem.changeWorkingFolder("Content");
  console.log("CWD => " + FileSystem.CurrentWorkingFolder);
  FileSystem.changeWorkingFolder("../");
  console.log("CWD => " + FileSystem.CurrentWorkingFolder);
  var file = FileSystem.getItem("Content/Test.md");
  console.log(file.getName());
}


function test_FileSystem_newItem() {
  var path = "/Content/TestItem.txt";
  var item = FileSystem.newItem(path, FileSystem.ItemType.File)
  console.log(item.getName());
}


function test_FileSystem__deleteChildItem() {
  var path = "/Content/TestItem.txt";
  var folderParent = FileSystem.getItem(FileSystem.splitPath(path));
  console.log(folderParent.getName());
  
  var nameChild = FileSystem.splitPath(path, true);
  FileSystem._deleteChildItem(folderParent.getId(), nameChild, FileSystem.ItemType.File, true);
}


function test_FileSystem_deleteItem() {
  var path = "/Content/TestItem.txt";
  
  var item = null;
  if(!(FileSystem.testPath(path))) {
    console.log(path + " dose not exist. creating...");
    item = FileSystem.newItem(path, FileSystem.ItemType.File);
  }
  else {
    item = FileSystem.getItem(path, FileSystem.ItemType,File);
  }
  
  console.log(item.getName() + " was created.");
  
  FileSystem.deleteItem(path, FileSystem.ItemType.File, true);
  console.log(path + " was deleted.");
  
  if(FileSystem.testPath(path)) {
    console.log(path + " is still accessible.");
  }
  else {
    console.log(path + " is not accessible.");
  }
}
