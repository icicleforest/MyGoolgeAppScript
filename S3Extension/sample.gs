// ADD LIBRARY: MB4837UymyETXyn8cv3fNXZc9ncYTrHL9

var S3_BUCKET_NAME = "my-bucket";
var S3_FILENAME_PREFIX = "gas-samples";

var S3_ACCESS_TOKEN = "";
var S3_SECRET_TOKEN = "";


function upload(blob, filename) {
  filename = !(filename) ? blob.getName() : filename;
  
  var s3 = S3.getInstance(S3_ACCESS_TOKEN, S3_SECRET_TOKEN, {logRequests: false, echoRequestToUrl: false});
  s3.putObject(S3_BUCKET_NAME, S3_FILENAME_PREFIX + "/" + filename, blob, {logRequests: false});
}


function S3Upload_test() {
  var text = "000000000000000000000000001";
  
  // RAW TEXT
  var blobRaw = Utilities.newBlob(text);
  blobRaw.setName("raw-text.txt");
  blobRaw.setContentType("text/plain");
  upload(blobRaw);
  
  // GZIP COMPRESSED
  var blobCompressed = Utilities.gzip(blobRaw);
  blobCompressed.setName(blobRaw.getName() + ".gz");
  blobCompressed.setContentType("application/x-gzip");
  upload(blobCompressed);
}

