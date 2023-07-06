import NetsuiteRest from "./netsuite-rest";

type QueryResult = {
  items: any[];
  hasMore: boolean;
}

export default class Suiteql extends NetsuiteRest {
  constructor(options) {
    if (typeof options !== "object")
      throw new TypeError("Please provide netsuite api credentials");
    super(options);
  }

  async connect() {
    return await this.request({
      path: "*",
      method: "OPTIONS",
    });
  }

  async query(string, limit = 1000, offset = 0): Promise<QueryResult> {
    let queryresult = {};
    if (typeof string !== "string")
      throw new TypeError("Query is not a string");
    if (limit > 1000) throw new Error("Max limit is 1000");
    // replace all \t with spaces as suggested in #5
    string = string.replace(/\t/g, ' ');
    string = string.replace(/\r?\n|\r/gm, "");
    let bodycontent = {q: string};

    return await this.request({
      path: `query/v1/suiteql?limit=${limit}&offset=${offset}`,
      method: "POST",
      body: bodycontent,
    }) as QueryResult
  }

  queryAll(string, limit = 1000) {
    let offset = 0;
    let stream = [];
    const getNextPage = async () => {
      let hasMore = true;
      while (hasMore === true) {
        let sqlresult = await this.query(string, limit, offset);
        sqlresult.items.forEach((item) => stream.push(item));
        hasMore = sqlresult.hasMore;
        offset = offset + limit;
      }
      stream.push(null);
    };
    getNextPage();
    return stream;
  }
}
