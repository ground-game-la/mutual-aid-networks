import {
  createLogic
} from "redux-logic";
import {
  mapValues,
  values,
  map,
} from 'lodash';
import {
  REQUEST_NETWORKS,
} from "./reducers";

import {
  setPageOfNetworks
} from "./actions";
import { NETWORK } from "../constants";

const fetchNetworks = createLogic({
  type: REQUEST_NETWORKS,

  process(deps, dispatch, done) {
    const {
      httpClient,
      firebaseUrl,
    } = deps;
    const processOnePage = (snapshot) => {
      return snapshot.body.documents.reduce((acc, doc) => {
        const data = doc.fields;
        const unpackedData = mapValues(data, (object) => {
          let newValues = values(object)[0];
          if (object.integerValue) {
            newValues = Number(newValues);
          }
          if (newValues.values) {
            newValues = map(newValues.values, obj => {
              return values(obj)[0];
            });
          }
          return newValues;
        })
        if (Number(unpackedData.id)) {
          unpackedData.category = NETWORK;
          acc.push(unpackedData);
        }
        return acc;
      }, []);
    }

    const requestPage = (url) => {
      return httpClient.get(url)
        .then((snapshot) => {
          const pageOfNetworks = processOnePage(snapshot)
          dispatch(setPageOfNetworks(pageOfNetworks))
          if (snapshot.body.nextPageToken) {
            const url = `${firebaseUrl}/?pageToken=${snapshot.body.nextPageToken}`
            return requestPage(url)
          }
          done();
        })
    }
    requestPage(firebaseUrl);
  }
})


export default [
  fetchNetworks,
];