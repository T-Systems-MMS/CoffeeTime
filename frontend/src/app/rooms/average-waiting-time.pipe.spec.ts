import { AverageWaitingTimePipe } from './average-waiting-time.pipe';

describe('AverageWaitingTimePipe', () => {
  it('create an instance', () => {
    const pipe = new AverageWaitingTimePipe();
    expect(pipe).toBeTruthy();
  });
});
