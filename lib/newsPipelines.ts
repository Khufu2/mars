export type NewsPipeline = {
  key: string;
  label: string;
  desk: string;
  description: string;
  topicKeywords: string[];
  geoKeywords: string[];
};

const africaGeo = [
  "Africa","Tanzania","Kenya","Uganda","Rwanda","Burundi","Ethiopia","Zambia",
  "Malawi","Mozambique","Ghana","Nigeria","South Africa","Zimbabwe","Botswana",
  "Namibia","Angola","Côte d'Ivoire","Senegal","Cameroon"
];

const eastAfricaGeo = [
  "East Africa","Tanzania","Kenya","Uganda","Rwanda","Burundi","Ethiopia",
  "South Sudan","Zanzibar"
];

export const newsPipelines: NewsPipeline[] = [
  {
    key:"ea-agriculture",
    label:"East Africa agriculture",
    desk:"Markets",
    description:"Production, crops, inputs, food security and farm economics across East Africa.",
    topicKeywords:["agriculture","farming","crop","grain","maize","rice","coffee","tea","sesame","cashew","fertilizer","irrigation","food security"],
    geoKeywords:eastAfricaGeo,
  },
  {
    key:"africa-commodities",
    label:"African commodities",
    desk:"Markets",
    description:"Commodity prices, supply, demand, processing and export markets.",
    topicKeywords:["commodity","maize","wheat","rice","coffee","cocoa","sesame","cashew","sunflower","soybean","beans","avocado","fertilizer","edible oil"],
    geoKeywords:africaGeo,
  },
  {
    key:"trade-logistics",
    label:"Trade & logistics",
    desk:"Trade",
    description:"Ports, corridors, freight, customs, exports and imports affecting food and agriculture.",
    topicKeywords:["port","shipping","freight","corridor","customs","export","import","trade","logistics","container","rail","truck"],
    geoKeywords:africaGeo,
  },
  {
    key:"climate-food",
    label:"Climate & food",
    desk:"Climate",
    description:"Rainfall, drought, floods, heat and climate shocks affecting crops and food markets.",
    topicKeywords:["drought","rainfall","flood","heatwave","El Niño","La Niña","climate","weather","crop failure","harvest"],
    geoKeywords:africaGeo,
  },
  {
    key:"policy-capital",
    label:"Policy & capital",
    desk:"Policy",
    description:"Agriculture policy, trade rules, finance, investment and agribusiness moves.",
    topicKeywords:["agriculture policy","food policy","export ban","import duty","tariff","agribusiness","agritech","agriculture investment","farm finance","commodity exchange"],
    geoKeywords:africaGeo,
  },
];

export function pipelineByKey(key:string) {
  return newsPipelines.find(item=>item.key===key);
}

export function newsApiQuery(pipeline:NewsPipeline) {
  const ors=(terms:string[])=>({ "$or":terms.map(keyword=>({keyword})) });
  return {
    "$query":{
      "$and":[ors(pipeline.topicKeywords),ors(pipeline.geoKeywords)]
    }
  };
}
