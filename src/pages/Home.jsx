import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import InvoiceBuilder from '../components/InvoiceBuilder/InvoiceBuilder';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                <Hero />

                {/* Anchor point for the builder */}
                <section id="builder-section" className="scroll-mt-16">
                    <InvoiceBuilder />
                </section>

                <Features />
                <Pricing />
            </main>

            <Footer />
        </div>
    );
};

export default Home;
