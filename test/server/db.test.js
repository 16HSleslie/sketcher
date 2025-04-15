const mongoose = require('mongoose');

describe('Database Connection', () => {
  it('should connect to MongoDB', () => {
    // This now relies on the global setup in jest.setup.js
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
});