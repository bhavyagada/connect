import * as Redux from 'redux';
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';

import rootReducer from './reducers';
import composeEnhancers from './devtools';
import { syncStateFromURL } from './actions/history';
import { analyticsMiddleware, trackPageView } from './analytics';

export const history = createBrowserHistory();

export function createAppStore(appHistory, preloadedState) {
  const store = Redux.createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(Redux.applyMiddleware(
      thunk.withExtraArgument(appHistory),
      analyticsMiddleware(appHistory),
    )),
  );

  let pathname = appHistory.location.pathname;
  appHistory.listen((location) => {
    const pathnameChanged = pathname !== location.pathname;
    pathname = location.pathname;

    trackPageView(location.pathname, store.getState());
    if (pathnameChanged) store.dispatch(syncStateFromURL());
  });

  return store;
}

const store = createAppStore(history);

export default store;
