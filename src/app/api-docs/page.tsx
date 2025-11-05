/**
 * API Documentation Page (Swagger UI)
 *
 * Interactive API documentation using Swagger UI.
 * Requires: npm install swagger-ui-react
 *
 * Related: Issue #85 - Missing API Documentation
 */

"use client";

import { useEffect, useState } from "react";

// Dynamically import SwaggerUI to avoid SSR issues
// NOTE: This will work after running: npm install swagger-ui-react
let SwaggerUI: any = null;

export default function ApiDocsPage() {
  const [isClient, setIsClient] = useState(false);
  const [swaggerUIComponent, setSwaggerUIComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);

    // Dynamically import Swagger UI
    import("swagger-ui-react")
      .then((module) => {
        setSwaggerUIComponent(() => module.default);
        // Also import the CSS
        import("swagger-ui-react/swagger-ui.css").catch(console.error);
      })
      .catch((err) => {
        console.error("Failed to load Swagger UI:", err);
        setError("swagger-ui-react is not installed");
      });
  }, []);

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  // Show error if swagger-ui-react is not installed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-center mb-8">
              <svg
                className="mx-auto h-16 w-16 text-red-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Installation Required
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                The <code className="bg-gray-100 px-2 py-1 rounded">swagger-ui-react</code> package is not installed.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Quick Setup
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Run the following command in your terminal to install the required package:
                  </p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                    npm install swagger-ui-react
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  What's Been Created
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Complete OpenAPI 3.0 specification with 23 endpoints</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Request/response schemas for all models</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Authentication support (Bearer token)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Thai and English descriptions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Error responses documented</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Access Raw OpenAPI Spec
                </h3>
                <p className="text-gray-700 mb-3">
                  You can access the raw OpenAPI specification without installing swagger-ui-react:
                </p>
                <a
                  href="/api/swagger"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  View OpenAPI JSON
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Alternative Tools
                </h3>
                <p className="text-gray-700 mb-3">
                  You can import the OpenAPI spec into these tools:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <a
                      href="https://editor.swagger.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Swagger Editor
                    </a>
                    {" "}(paste the JSON from /api/swagger)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <a
                      href="https://www.postman.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Postman
                    </a>
                    {" "}(import OpenAPI spec)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <a
                      href="https://insomnia.rest/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Insomnia
                    </a>
                    {" "}(import OpenAPI spec)
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                For more information, see{" "}
                <a href="/SWAGGER_SETUP.md" className="text-blue-600 hover:underline">
                  SWAGGER_SETUP.md
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Swagger UI if loaded
  if (!swaggerUIComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Swagger UI...</p>
        </div>
      </div>
    );
  }

  const SwaggerUIComponent = swaggerUIComponent;

  return (
    <div className="min-h-screen bg-white">
      <SwaggerUIComponent
        url="/api/swagger"
        docExpansion="list"
        defaultModelsExpandDepth={1}
        filter={true}
        tryItOutEnabled={true}
        persistAuthorization={true}
      />
    </div>
  );
}
