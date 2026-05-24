const { useThemeStore } = require('./themeStore');

test('themeStore toggle and setTheme', () => {
  // Ensure initial theme is light
  useThemeStore.setState({ theme: 'light' });

  // toggleTheme should switch to dark
  useThemeStore.getState().toggleTheme();
  expect(useThemeStore.getState().theme).toBe('dark');

  // setTheme should set explicitly
  useThemeStore.getState().setTheme('light');
  expect(useThemeStore.getState().theme).toBe('light');
});
