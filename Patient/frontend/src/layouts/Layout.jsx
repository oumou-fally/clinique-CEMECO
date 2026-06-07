import React from 'react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

export default function Layout({children}){
  return (
    <div>
      <Header />
      <main style={{padding:16}}>{children}</main>
      <Footer />
    </div>
  )
}
