import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import Loading from '../components/common/Loading';

export default function EditorPage() {
  const { productId } = useParams();

  return (
    <>
      <Helmet>
        <title>Design Editor | PrintJack</title>
      </Helmet>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#E63946] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-xl font-bold text-[#1D3557] mb-2">Design Editor</h1>
          <p className="text-gray-500 text-sm mb-4">Product ID: {productId}</p>
          <p className="text-gray-400 text-sm">Custom design editor coming soon.</p>
        </div>
      </div>
    </>
  );
}
