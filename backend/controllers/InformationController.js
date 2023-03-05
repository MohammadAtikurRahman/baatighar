const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const stringSimilarity = require('string-similarity');

let dataArray = [];
fs.createReadStream("idiya.csv")
  .pipe(csv())
  .on("data", (data) => {
    dataArray.push(data);
  })
  .on("end", () => {
    processData(dataArray);
  });

const processData = (data) => {
  // console.log(data);
};






async function getInformation(req, res) {
  let message = req.body.message;
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
   
   
   
    const matchingData1 = dataArray.find(
      (d) => message.includes(d.name) && message.includes("dimension")
    );
    const matchingData2 = dataArray.find((d) => d.name === message || message.includes("stock") || message.includes("available"));

    console.log("matching data",matchingData2)



    


    const matchingData3 = dataArray.find((d) => d.sku === message);






    if (matchingData2) {









      res.json({
        botResponse: `\n\n${matchingData2.name} is available in Dhaka : ${matchingData2.dhk} Aziz Super Market  : ${matchingData2.aziz}  Chittagong : ${matchingData2.ctg} Sylhet  : ${matchingData2.syl}  Bangla Bazar  : ${matchingData2.banglabazar}   Ecommerce  : ${matchingData2.ecomm} `,
      });
      return;
    } 
    
    
    else if (matchingData3) {
      res.json({
        botResponse: `\n\n${matchingData3.name} of : ${matchingData3.description}
          }`,
      });
      return;
    } 
    
    
    else if (matchingData1) {
      const dimensions = {
        width: matchingData1.width,
        height: matchingData1.height,
        length: matchingData1.length,
      };
      res.status(200).json({
        botResponse: `\n\nWidth: ${dimensions.width}, Height: ${dimensions.height}, Length: ${dimensions.length}`,
      });
      return;
    }

   



    const matches = stringSimilarity.findBestMatch(message, dataArray.map(d => d.name)  );
    let matchedItems = []; 
    if (matches.bestMatch.rating > 0.3) {
      const matchedItem = dataArray[matches.bestMatchIndex];
      matchedItems.push(matchedItem);
    } else {
      console.log('No match found');
    }
    console.log("matched item:", matchedItems[0]);    
    const itemName = matchedItems[0];    
    console.log("ok version",itemName)





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





























    



 



    const queries = properties.filter((p) => message.includes(p.name) );


    console.log("matching queries",queries);









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

    return res.json({ botResponse: `\n\n`+ "  "+ itemName.name+" " + response });
  }
}

module.exports = {
  getInformation,
};
