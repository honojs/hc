import type { MockAgent } from 'undici';
declare global {
    function getMiniflareFetchMock(): MockAgent;
}
