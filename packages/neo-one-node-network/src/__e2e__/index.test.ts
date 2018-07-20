describe('@neo-one/node-network', () => {
  test('time to import', async () => {
    const time = await one.measureImport('@neo-one/node-network');
    expect(time).toBeLessThan(1600);
  });

  test('time to require', async () => {
    const time = await one.measureRequire('@neo-one/node-network');
    expect(time).toBeLessThan(600);
  });
});
