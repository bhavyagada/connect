import { vi } from 'vitest';
import { createMemoryHistory } from 'history';

import { api } from '../api/backend';
import { syncStateFromURL } from './history';
import { ACTION_APPLY_DESTINATION } from './types';
import * as actions from './index';

vi.mock('../api/backend', () => ({
  api: {
    auth: { isAuthenticated: () => false },
    routes: { getRoutesSegments: vi.fn() },
  },
}));
vi.mock('./index', () => ({
  checkRoutesData: vi.fn(), checkLastRoutesData: vi.fn(),
  primeFetchSubscription: vi.fn(), fetchDeviceOnline: vi.fn(), fetchSharedDevice: vi.fn(),
}));
vi.mock('../timeline', () => ({
  currentOffset: vi.fn(() => 0),
}));
vi.mock('../utils/webrtc', () => ({
  webrtcConnectionManager: { disconnect: vi.fn() },
}));

const DONGLE = '0000aaaa0000aaaa';
const OTHER = '1111bbbb1111bbbb';
const LOG = '2026-08-06--12-00-00';
const baseState = { dongleId: DONGLE, devices: [], zoom: null, selectedRouteId: null };

function create(pathname = '/', state = baseState) {
  const store = { getState: vi.fn(() => state), dispatch: vi.fn() };
  const history = createMemoryHistory({ initialEntries: [pathname] });
  return { store, history };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('URL synchronization', () => {
  it('selects a changed device and refreshes routes', async () => {
    const { store, history } = create(`/${OTHER}`);
    await syncStateFromURL()(store.dispatch, store.getState, history);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: ACTION_APPLY_DESTINATION,
      destination: { dongleId: OTHER, routeId: null, range: undefined },
    });
    expect(actions.checkLastRoutesData).toHaveBeenCalledOnce();
  });

  it('converts a legacy timestamp range to a route', async () => {
    api.routes.getRoutesSegments.mockResolvedValue([{ fullname: `${DONGLE}|${LOG}` }]);
    const pathname = `/${DONGLE}/1000/2000`;
    const { store, history } = create(pathname);
    await syncStateFromURL()(store.dispatch, store.getState, history);
    expect(api.routes.getRoutesSegments).toHaveBeenCalledWith(DONGLE, 1000, 2000);
    expect(history.location.pathname).toBe(`/${DONGLE}/${LOG}`);
    expect(history.location.search).toBe('');
  });
});
