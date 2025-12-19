
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    CheckCircle2,
    TrendingUp,
    Users,
    Shield,
    ArrowRight,
    Zap,
    BarChart3,
    School,
    Menu,
    X
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white font-sans overflow-x-hidden selection:bg-purple-500/30">

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#030014]/70 backdrop-blur-xl border-white/5 py-4' : 'bg-transparent border-transparent py-6'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-200"></div>
                            <div className="relative w-10 h-10 bg-[#0A0A0F] rounded-lg flex items-center justify-center border border-white/10">
                                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-blue-400">SF</span>
                            </div>
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            SoutienFlow
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Fonctionnalités</a>
                        <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Prix</a>
                        <div className="flex items-center gap-4 ml-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="text-sm font-medium text-white hover:text-purple-400 transition-colors"
                            >
                                Se connecter
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="group relative px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/50 overflow-hidden transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-purple-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative text-sm font-semibold">Get Started</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-5xl mx-auto text-center"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">Le CRM #1 au Maroc</span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                        Gérez votre centre <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 animate-gradient-x">
                            sans limites.
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Une plateforme tout-en-un pour gérer les inscriptions, suivre les paiements et optimiser la réussite de vos étudiants.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button
                            onClick={() => navigate('/signup')}
                            className="relative w-full sm:w-auto px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative flex items-center justify-center gap-2">
                                Commencer Gratuitement <ArrowRight className="w-5 h-5" />
                            </span>
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                            Voir la démo
                        </button>
                    </motion.div>

                    {/* Dashboard Mockup */}
                    <motion.div
                        style={{ opacity, scale }}
                        className="relative max-w-6xl mx-auto rounded-xl border border-white/10 bg-[#0A0A0F]/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 opacity-50"></div>

                        {/* Mock UI Content */}
                        <div className="p-4 md:p-8 h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                </div>
                                <div className="w-full max-w-md mx-auto h-6 rounded-md bg-white/5 hidden md:block"></div>
                            </div>

                            <div className="flex-1 grid grid-cols-12 gap-6">
                                {/* Sidebar Mock */}
                                <div className="hidden md:flex col-span-2 flex-col gap-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-10 rounded-lg bg-white/5 w-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                                    ))}
                                </div>
                                {/* Main Content Mock */}
                                <div className="col-span-12 md:col-span-10 grid grid-cols-3 gap-6">
                                    <div className="col-span-3 h-32 rounded-xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/5 p-6 relative overflow-hidden">
                                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
                                        <div className="h-8 w-48 bg-white/10 rounded-lg mb-4"></div>
                                        <div className="h-4 w-32 bg-white/5 rounded-lg"></div>
                                    </div>
                                    <div className="h-40 rounded-xl bg-white/5 border border-white/5"></div>
                                    <div className="h-40 rounded-xl bg-white/5 border border-white/5"></div>
                                    <div className="h-40 rounded-xl bg-white/5 border border-white/5"></div>
                                    <div className="col-span-3 h-64 rounded-xl bg-white/5 border border-white/5 mt-4"></div>
                                </div>
                            </div>
                        </div>

                        {/* Glow Overlay */}
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none"></div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Bento Grid Features */}
            <section id="features" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
                            Tout ce dont vous avez besoin.
                        </h2>
                        <p className="text-gray-400 text-lg">Une suite d'outils puissants pour propulser votre centre vers l'excellence.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Large Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-2 bg-[#0A0A0F] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 text-purple-400">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Analytics Avancés</h3>
                                <p className="text-gray-400 mb-8 max-w-md">Suivez la performance de vos étudiants et la santé financière de votre centre avec des tableaux de bord interactifs en temps réel.</p>
                                <div className="h-48 rounded-xl bg-gradient-to-b from-[#13131F] to-transparent border border-white/5 relative overflow-hidden">
                                    {/* Chart Mock */}
                                    <div className="absolute inset-x-0 bottom-0 h-32 flex items-end justify-around px-4 pb-4 gap-2">
                                        {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
                                            <div key={i} className="w-full bg-purple-500/20 rounded-t-sm relative group/bar">
                                                <div className="absolute bottom-0 inset-x-0 bg-purple-500/50 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Small Card 1 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#0A0A0F] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 text-blue-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Gestion Étudiants</h3>
                            <p className="text-gray-400">Base de données complète avec historique, niveaux et contacts parents.</p>
                        </motion.div>

                        {/* Small Card 2 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#0A0A0F] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20 text-green-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Suivi Financier</h3>
                            <p className="text-gray-400">Génération automatique des reçus et suivi des impayés.</p>
                        </motion.div>

                        {/* Wide Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-2 bg-[#0A0A0F] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20 text-amber-400">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Sécurité Maximale</h3>
                                    <p className="text-gray-400">Vos données sont chiffrées de bout en bout. Sauvegardes automatiques quotidiennes pour une tranquillité d'esprit totale.</p>
                                </div>
                                <div className="flex-1 w-full relative">
                                    <div className="aspect-square w-full max-w-[200px] mx-auto rounded-full border border-white/10 flex items-center justify-center relative">
                                        <div className="absolute inset-0 border border-green-500/20 rounded-full animate-ping [animation-duration:3s]"></div>
                                        <Shield className="w-16 h-16 text-green-500/50" />
                                        <div className="absolute top-0 right-0 p-2 bg-[#0A0A0F] border border-white/10 rounded-lg shadow-xl translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs font-bold text-green-500">Secured</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#030014] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            SF
                        </div>
                        <span className="font-bold text-lg text-gray-300">SoutienFlow</span>
                    </div>
                    <p className="text-gray-500 text-sm">© 2024 SoutienFlow. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
