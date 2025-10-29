const config = {
  plugins: {
    // Tailwind's PostCSS plugin moved to a separate package (@tailwindcss/postcss)
    // and this project already lists it in devDependencies.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;
