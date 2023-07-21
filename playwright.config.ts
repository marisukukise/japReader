import { PlaywrightTestConfig } from '@playwright/test';

const TIMEOUT_SECONDS = 180

const config: PlaywrightTestConfig = {
    testDir: './tests',
    timeout: TIMEOUT_SECONDS * 1000,
    expect: {
        toMatchSnapshot: { threshold: 0.2 },
    },
};

export default config;