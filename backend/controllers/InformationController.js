const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const stringSimilarity = require("string-similarity");

// let dataArray = [];
// fs.createReadStream("idiya.csv")
//   .pipe(csv())
//   .on("data", (data) => {
//     dataArray.push(data);
//   })
//   .on("end", () => {
//     processData(dataArray);
//   });

// const processData = (data) => {
//    console.log(data);
// };




const API_ENDPOINT = 'https://baatighar.com/openai_chatgpt/products/dataset';
const API_KEY = 'wO8oenVz5Qbg9GNqGel2OcBNbbA';
const headers = [
  'name',
  'aziz',
  'ctg',
  'dhk',
  'syl',
  'bb',
  'ecom',
  'id',
  'reference',
  'price',
  'website_price',
  'discount_percent'
];

const dataArray = [];

axios.get(API_ENDPOINT, {
  headers: {
    'X-Authorization': API_KEY
  },
  responseType: 'stream'
})
  .then(response => {
    response.data.pipe(csv())
      .on('data', (row) => {
        const newRow = {};
        for (let i = 0; i < headers.length; i++) {
          newRow[headers[i]] = row[headers[i]] || '';
        }
        dataArray.push(newRow);
      })
      .on('end', () => {
        console.log(dataArray);
      });
  })
  .catch(error => {
    console.error(error);
  });


  

async function getInformation(req, res) {
  let message = req.body.message;

  message = message.replace(
    /\b(aza|ajes|azej|ajez|ajij|azz|azziz|a[zijes]\w*|\b(super\s*(market|store|center)|market\s*super)\b|as(?=.*\bsuper\s*(market|store|center))|ae(?=.*\bsuper\s*(market|store|center))|aj(?=.*\bsuper\s*(market|store|center))|ai(?=.*\bsuper\s*(market|store|center)))\b/gi,
    "aziz"
  );
  
  


  message = message.replace(
    /bangla\s*bazar|banglabazar|bangla\s*baza*r*|b\s*bazar|\bbangla\b|b\s*baza*r*/gi,
    "bb"
  );
  message = message.replace(/BB|bb/gi, "bb");
  message = message.replace(/\bdhk\b|\bdhaka\b/gi, "dhk");
  message = message.replace(
    /\bdh(?:aka|aka\s*city|aka\s*metropolitan)?\b|\bdhk\b|\bdacca\b|\bdekha\b|\bdhoka\b|\bdakka\b|\bdhokka\b|\bdhakka\b|\bdaccka\b|\bdhak\b|\bdhacca\b/gi,
    "dhk"
  );
  message = message.replace(/\bpric(es|ed|ing)?\b/gi, "price");
  message = message.replace(
    /\bpr[ic][ie]?[sz]?(\s*[ck]ost)?(\s*[ck]o[st])?(\s*p)?/gi,
    "price"
  );
  message = message.replace(
    /\bctg\b|\bchittagong\b|\bchittagng\b| \bchttogm\b|\bchittgong\b|\bchittagram\b|\bchattogram\b|\bchittagrom\b|\bchattagam\b|\bchattagrm\b|\bchattaram\b|\bchattagm\b|\bchittagorm\b|\bchattagong\b|\bchattagram\b|\bchatga\b|\bchatg\b|\bchtg\b|\bctgcity\b|\bctgcitycorp\b|\bctgcorp\b|\bctgport\b|\bchittagongport\b|\bctgcitycorporation\b|\bchittagongcity\b|\bchittagongcitycorp\b/gi,
    "ctg"
  );
  message = message.replace(
    /\bsyl(?!(het|khet))\b|\bsylhet\b|\bsyhle\b|\bsyleh\b|\bsileta\b|\bsiletta\b|\bsailet\b|\bsaillet\b|\bsyleth\b|\bsyhlet\b|\bsyhleth\b|\bsyle\b|\bsyhleth\b|\bsyllet\b|\bsailette\b|\bsylette\b/gi,
    "syl"
  );
  message = message.replace(
    /\be\s*c\s*o\s*m\s*(m\s*e\s*r\s*c\s*e\s*)?(?!\s*[^\s]*?log)/gi,
    "ecommerce"
  );

  const properties = [
    { name: "name", property: "name" },
    { name: "aziz", property: "aziz" },
    { name: "ctg", property: "ctg" },
    { name: "dhk", property: "dhk" },
    { name: "syl", property: "syl" },
    { name: "bb", property: "bb" },
    { name: "ecom", property: "ecom" },
    { name: "price", property: "price" },
  ];

  for (const prop of properties) {
    const matches2 = stringSimilarity.findBestMatch(
      message.toLowerCase(),
      dataArray.map((d) => d.name.toLowerCase())
    );
    let matchedItems2 = [];
    if (matches2.bestMatch.rating > 0.2) {
      const matchedItem2 = dataArray[matches2.bestMatchIndex];
      matchedItems2.push(matchedItem2);
    } else {
      console.log("No match found");
    }
    // console.log("matched item:", matchedItems2[0]);
    const matchingData2 = matchedItems2[0];
    // console.log("ok version 2", matchingData2);

    // const matchingData2 = dataArray.find((d) => d.name === message || message.includes("stock") || message.includes("available"));

    // console.log("matching data 2", matchingData2);

    const matchingData3 = dataArray.find((d) => d.sku === message);

    const queries2 = properties.filter((p) => message.includes(p.name));

    // console.log("matching queries 2", queries2);

    if (matchingData2) {
      if (queries2.length === 0) {
        res.json({
          botResponse: `\n\n${matchingData2.name} is available in Dhaka ${matchingData2.dhk}. Aziz Super Market ${matchingData2.aziz}. Chittagong ${matchingData2.ctg}. Sylhet ${matchingData2.syl}. Bangla Bazar ${matchingData2.bb}. Ecommerce ${matchingData2.ecom}.`,
        });
        return;
      }
    } else if (matchingData3) {
      res.json({
        botResponse: `\n\n${matchingData3.name} of : ${matchingData3.description}
          }`,
      });
      return;
    }

    const matches = stringSimilarity.findBestMatch(
      message,
      dataArray.map((d) => d.name)
    );
    let matchedItems = [];
    if (matches.bestMatch.rating > 0.3) {
      const matchedItem = dataArray[matches.bestMatchIndex];
      matchedItems.push(matchedItem);
    } else {
      console.log("No match found");
    }
    // console.log("matched item:", matchedItems[0]);
    const itemName = matchedItems[0];
    // console.log("ok version", itemName);

    if (!itemName) {
      try {
        const API_KEY = process.env.OPENAI_API_KEY;
        const response = await axios({
          method: "post",
          url: "https://api.openai.com/v1/engines/text-davinci-003/completions",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          data: {
            prompt: message,
            max_tokens: 100,
            n: 1,
            stop: "",
            temperature: 0.5,
          },
        });

        return res.json({ botResponse: "\n" + response.data.choices[0].text });
      } catch (error) {
        return res
          .status(500)
          .send({ error: "Could not generate text completion" });
      }
    }

    const queries = properties.filter((p) => message.includes(p.name));

    console.log("matching queries", queries);

    const replacements = {
      dhk: "Dhaka",
      syl: "Sylhet",
      bb: "Bangla Bazar",
      aziz: "Aziz Super Market",
      ecom: "Ecommerce",
      ctg: "Chittagong",
    };

    const result = queries
      .map((q) => {
        const data = dataArray.find((d) => d.name === itemName.name);
        if (!data || !data[q.property]) {
          return null;
        }

        return { [q.name]: data[q.property] };
      })
      .filter((r) => r !== null);
    if (result.length === 0) {
      return res.status(400).json({ error: "No matching data found" });
    }

    const response = result.reduce((prev, curr) => {
      return prev + ` ${Object.keys(curr)[0]}: ${curr[Object.keys(curr)[0]]} `;
    }, "");

    let modifiedResponse = response;
    for (const [key, value] of Object.entries(replacements)) {
      modifiedResponse = modifiedResponse.replace(key, value);
    }

    //  return res.json({ botResponse: `\n\n${itemName.name} ${modifiedResponse.replace(/:/g, '')}.` });

    // return res.json({ botResponse: `\n\n${itemName.name} ${modifiedResponse.replace(/:/g, '')}.`.replace(/\. /g, '.  ') });

    let responseText = modifiedResponse.replace(/:/g, "").replace(/(\d)\s/g, "$1.");

    if (responseText.includes("price")) {
      // If response contains a price, don't display "is available"
      return res.json({
        botResponse: `\n\n${itemName.name} ${responseText.replace("price", "Price")}`,
      });
    } else {
      // If response doesn't contain a price, display "is available"
      return res.json({
        botResponse: `\n\n${itemName.name} is available in ${responseText}`,
      });
    }
    
  }
}

module.exports = {
  getInformation,
};
