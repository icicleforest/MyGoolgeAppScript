/**
 * My extensions for S3 Library (MB4837UymyETXyn8cv3fNXZc9ncYTrHL9)
 *                              https://github.com/eschultink/S3-for-Google-Apps-Script/
 */



/**
 * S3.S3.prototype.putObject()の上書き
 */
S3.S3.prototype.putObject = function(bucket, objectName, object, options) {
  options = options || {};

  var request = new S3.S3Request(this);
  request.setHttpMethod('PUT');
  request.setBucket(bucket);
  request.setObjectName(objectName);
  
  var failedBlobDuckTest = !(typeof object.copyBlob == 'function' &&
                      typeof object.getDataAsString == 'function' &&
                      typeof object.getContentType == 'function'
                      );
  
  //wrap object in a Blob if it doesn't appear to be one
  if (failedBlobDuckTest) {
    object = Utilities.newBlob(JSON.stringify(object), "application/json");
    object.setName(objectName);
  }
  
  var contentType = object.getContentType();
  
  // Content-Typeに応じてBlobからのデータ取得方法を切り替える
  if(/^text\//.test(contentType)) {
    request.setContent(object.getDataAsString());
  }
  else if(/^application\/(octet-stream|(x-)?gzip)/.test(contentType)) {
    request.setBinaryContent(object.getBytes());
  }
  else {
    request.setContent(object.getDataAsString());
  }
  request.setContentType(contentType);  
  
  request.execute(options);  
};


/**
 * S3Requestにバイナリデータを登録
 */
S3.S3Request.prototype.setBinaryContent = function(content) {
  this.content = content;
  return this;
};


/**
 * S3.S3Request.prototype.getContentMd5_()の上書き
 * バイナリデータに対応
 */
S3.S3Request.prototype.getContentMd5_ = function() {
  if (this.content.length > 0) {
    if(typeof(this.content) === "string") {
      return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, this.content, Utilities.Charset.UTF_8));
    }
    else {
      if(!(this._md5checksum)) {
        this._md5checksum = new Md5CheckSum(this.content);
      }
      return this._md5checksum.getBase64String();
    }
  } else {
    return ""; 
  }
};

