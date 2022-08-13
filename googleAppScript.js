function MD5(input) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input, Utilities.Charset.UTF_8))
}

function SHA1(text) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, text);
  var txtHash = "";

  for (i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

function set_entry(universe_id, datastore, key, data) {
  options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': {
      'x-api-key': PropertiesService.getScriptProperties().getProperty("API_KEY"),
      'content-md5': MD5(data),
    },
    'payload': data,
  }

  return UrlFetchApp.fetch(`https://apis.roblox.com/datastores/v1/universes/${universe_id}/standard-datastores/datastore/entries/entry?datastoreName=${datastore}&entryKey=${key}`, options)
}

function publish_to_roblox() {
  spread_id = SpreadsheetApp.getActiveSpreadsheet().getId()
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(function (sheet) {
    sha = SHA1(spread_id + "||" + sheet.getSheetId())
    response = UrlFetchApp.fetch("https://docs.google.com/spreadsheets/d/" + spread_id + "/gviz/tq?tqx=out:json&headers=1&gid=" + sheet.getSheetId())
    if (response.getResponseCode() == 200) {
      json = response.getContentText().match("{.+}")
      PropertiesService.getScriptProperties().getProperty("UNIVERSE_IDS").split(",").forEach(function (universe_id) {
        set_entry(Number(universe_id), "SheetValuesV2", sha, JSON.stringify(json))
      })
    } else {
      Logger.log(response.getContentText())
    }
  })
}