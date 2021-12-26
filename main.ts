function getRandomIndex(options: (string)[]): number {
  return Math.floor(Math.random() * options.length);
}

async function reply(replyToken: string, msg: string): Promise<void> {
  const channelToken = PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN');
  const url = "https://api.line.me/v2/bot/message/reply";
  let message = {
    "replyToken": replyToken,
    "messages": [{ "type": "text", "text": msg }]
  };

  let options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + channelToken
    },
    "payload": JSON.stringify(message)
  };

  UrlFetchApp.fetch(url, options);
}

async function createResponseFromTextMessage(msg: string): Promise<string> {
  // Get phrase list
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName("Phrases");
  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(1, 1, lastRow).getValues();
  const replyOptions = values.map((value) => { return value[0] });

  // Choose reply ramdomly
  let replyMsg = replyOptions[getRandomIndex(replyOptions)];

  if (Math.random() < 0.1) {
    // Learn new phrase
    sheet.getRange(lastRow + 1, 1).setValue(msg);
    replyMsg = msg + "!!!";
  }

  return replyMsg;
}

async function createResponseFromImageMessage(numOfImages): Promise<string> {
  const index = Math.floor(Math.random() * numOfImages);

  return (index + 1) + "番目のやつが一番いいと思うにゃ！";
}

function doPost(e) {
  // Get event from LINE
  const json = e.postData.contents;
  const events = JSON.parse(json).events;

  let handledImageSet = [];

  (async() => {
    for (const event of events) {
      if (event.type == "message") {
        if (event.message.type == "text") {
          const msg = await createResponseFromTextMessage(event.message.text);
          await reply(event.replyToken, msg);

        } else if (event.message.type == "image") {
          if ("imageSet" in event.message) {
            // the event has more than 1 image
            if (!handledImageSet.includes(event.message.imageSet.id)) {
              // It's first time to handle this imageSet ID
              const msg = await createResponseFromImageMessage(event.message.imageSet.total);
              await reply(event.replyToken, msg);
              handledImageSet.push(event.message.imageSet.id);
            }

          } else {
            // the event has only 1 image
            await reply(event.replyToken, "いいね！");
          }
        }
      }
    }
  })();
}

function remindMeal(): void {
  const channelToken = PropertiesService.getScriptProperties().getProperty('LINE_ACCESS_TOKEN');
  const url = "https://api.line.me/v2/bot/message/broadcast";
  const msgOptions = [
    "ごはん！", "おなかすいた"
  ];

  let msg = msgOptions[getRandomIndex(msgOptions)];
  let message = {
    "messages": [{ "type": "text", "text": msg }]
  };

  let options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + channelToken
    },
    "payload": JSON.stringify(message)
  };

  UrlFetchApp.fetch(url, options);
}