import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="lenwell cms" content="App" />
            <script
                async
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API}&libraries=places`}
            >
            </script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument