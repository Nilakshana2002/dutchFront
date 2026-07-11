import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, link, loading, trend, trendLabel }) => {
    const Card = link ? Link : 'div';
    const cardProps = link ? { to: link } : {};

    return (
        <Card
            {...cardProps}
            className="bg-white rounded-2xl shadow-sm p-5 border border-navy-100 hover:shadow-md hover:border-navy-200 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group block"
        >
            {/* Background gradient accent */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                        <Icon size={22} />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                            trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {trend >= 0 ? '+' : ''}{trend}%
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-navy-400 text-xs font-semibold tracking-wide uppercase mb-1">{title}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-navy-100 rounded-lg animate-pulse" />
                    ) : (
                        <h3 className="text-2xl font-bold text-navy-900 leading-none">{value ?? '—'}</h3>
                    )}
                    {trendLabel && !loading && (
                        <p className="text-xs text-navy-400 mt-1">{trendLabel}</p>
                    )}
                </div>

                {link && (
                    <div className="mt-3 flex items-center text-xs font-medium text-navy-400 group-hover:text-teal-600 transition-colors">
                        <span>View details</span>
                        <ArrowRight size={12} className="ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StatCard;
