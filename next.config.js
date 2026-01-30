module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/notifications",
      "@mantine/modals",
      "@mantine/dates",
      "@mantine/dropzone",
      "@mantine/form",
      "@mantine/nprogress",
      "@tabler/icons-react",
      "mantine-react-table",
      "dayjs",
    ],
  },
};
