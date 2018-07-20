describe('@neo-one/utils', () => {
  test('time to import', async () => {
    const time = await one.measureImport('@neo-one/utils');
    expect(time).toBeLessThan(300);
  });

  test('time to require', async () => {
    const time = await one.measureRequire('@neo-one/utils');
    expect(time).toBeLessThan(100);
  });
});