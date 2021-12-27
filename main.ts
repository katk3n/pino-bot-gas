function getRandomMessage(options: (string)[]): string {
  return options[Math.floor(Math.random() * options.length)];
}

function reply(replyToken: string, msg: string): void {
  const channelToken = PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN');
  const url = "https://api.line.me/v2/bot/message/reply";
  let message = {
    "replyToken": replyToken,
    "messages": [{ "type": "text", "text": msg }]
  };

  UrlFetchApp.fetch(url, {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + channelToken
    },
    "payload": JSON.stringify(message)
  });
}

function createResponseFromTextMessage(msg: string): string {
  // Get phrase list
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName("Phrases");
  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(1, 1, lastRow).getValues();
  const replyOptions = values.map((value) => { return value[0] });

  // Choose reply ramdomly
  let replyMsg = getRandomMessage(replyOptions);

  if (Math.random() < 0.1) {
    // Learn new phrase
    sheet.getRange(lastRow + 1, 1).setValue(msg);
    replyMsg = msg + "!!!";
  }

  return replyMsg;
}

function createResponseFromImageMessage(numOfImages: number): string {
  const index = Math.floor(Math.random() * numOfImages);

  return (index + 1) + "番目のやつが一番いいと思うにゃ！";
}

function doPost(e) {
  // Get event from LINE
  const json = e.postData.contents;
  const events = JSON.parse(json).events;

  for (const event of events) {
    if (event.type == "message") {
      if (event.message.type == "text") {
        const msg = createResponseFromTextMessage(event.message.text);
        reply(event.replyToken, msg);

      } else if (event.message.type == "image") {
        if ("imageSet" in event.message) {
          // the event has more than 1 image
          if (event.message.imageSet.index == 1) {
            // Only handle the first imageSet index of the imageSet ID
            const msg = createResponseFromImageMessage(event.message.imageSet.total);
            reply(event.replyToken, msg);
          }

        } else {
          // the event has only 1 image
          reply(event.replyToken, "いいね！");
        }
      }
    }
  }
}

function remindMeal(): void {
  const channelToken = PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN');
  const url = "https://api.line.me/v2/bot/message/broadcast";
  const msgOptions = [
    "ごはん！", "おなかすいた"
  ];

  let message = {
    "messages": [{ "type": "text", "text": getRandomMessage(msgOptions) }]
  };

  UrlFetchApp.fetch(url, {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + channelToken
    },
    "payload": JSON.stringify(message)
  });
}