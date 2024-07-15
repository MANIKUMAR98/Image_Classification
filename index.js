import fs from 'fs';
import weaviate from 'weaviate-ts-client';
import path from 'path';


const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
});


const schemaConfig = {
    'class': 'UPS',
    'vectorizer': 'img2vec-neural',
    'vectorIndexType': 'hnsw',
    'moduleConfig': {
        'img2vec-neural': {
            'imageFields': [
                'image'
            ]
        }
    },
    'properties': [
        {
            'name': 'image',
            'dataType': ['blob']
        }
    ]
}

// await client.schema
//     .classCreator()
//     .withClass(schemaConfig)
//     .do();

const schemaRes = await client.schema.getter().do();

console.log(schemaRes)

// data to get the object ids
const getObjectIds = async () => {
    try {
        const response = await client.graphql.get()
            .withClassName('UPS')
            .withFields(['_additional { id }'])
            .do();

        const objects = response.data.Get.UPS;
        return objects.map(obj => obj._additional.id);
    } catch (error) {
        console.error("Error retrieving object IDs:", error);
    }
};

// Example usage
getObjectIds().then(ids => {
    console.log("Object IDs:", ids);
});


 // upload
//  const images = fs.readdirSync('./img');
//  const promises = images.map(async (imgFile) => {
//     if(imgFile != '.DS_Store') {
//         console.log(imgFile)
//         const imageData = fs.readFileSync(`img/${imgFile}`);
//         console.log(imageData)

//         const base64Image = imageData.toString('base64');

//         const response = await client.data
//             .creator()
//             .withClassName('UPS')
//             .withProperties({
//                 image: base64Image,
//                 text: text
//             })
//             .do();
//     }
//  });



const test = Buffer.from(fs.readFileSync('test.png') ).toString('base64');

const resImage = await client.graphql.get()
  .withClassName('UPS')
  .withFields(['image'])
  .withNearImage({ image: test })
  .withLimit(1)
  .do();
  const result = resImage.data.Get.UPS[0].image;
  console.log(result)
  fs.writeFileSync('./result.jpg', result, 'base64');


  /// --------------////
  const fetchData = async () => {
    try {
        const response = await client.graphql.get()
            .withClassName('UPS')
            .withFields(['image']) // Specify fields you want to retrieve
            .do();

        return response.data.Get.UPS;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

const processFetchedData = async () => {
    const data = await fetchData();
    if (data && data.length > 0) {
        data.forEach(item => {
            console.log("ID:", item.id);
            console.log("Image (base64):", item.image);
            // Add your processing logic here
        });
    } else {
        console.log("No data found.");
    }
};

// processFetchedData();

///---------------------////