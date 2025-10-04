import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid, BarChart, Bar } from 'recharts';
import { TrendingUp, Lightbulb, Activity, Sparkles, Car, ArrowUpRight, ArrowDownRight, Target, Zap, Brain, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const forecastAnalysisData = {
    'Tata Harrier': {
        history: [
            { ds: '2025-07-06T00:00:00.000Z', y: 120, net_sentiment: 0.65 }, 
            { ds: '2025-07-13T00:00:00.000Z', y: 125, net_sentiment: 0.68 },
            { ds: '2025-07-20T00:00:00.000Z', y: 118, net_sentiment: 0.60 }, 
            { ds: '2025-07-27T00:00:00.000Z', y: 130, net_sentiment: 0.72 },
            { ds: '2025-08-03T00:00:00.000Z', y: 135, net_sentiment: 0.75 }, 
            { ds: '2025-08-10T00:00:00.000Z', y: 122, net_sentiment: 0.55 },
            { ds: '2025-08-17T00:00:00.000Z', y: 110, net_sentiment: 0.40 }, 
            { ds: '2025-08-24T00:00:00.000Z', y: 115, net_sentiment: 0.45 },
            { ds: '2025-08-31T00:00:00.000Z', y: 128, net_sentiment: 0.62 }, 
            { ds: '2025-09-07T00:00:00.000Z', y: 140, net_sentiment: 0.78 },
            { ds: '2025-09-14T00:00:00.000Z', y: 145, net_sentiment: 0.82 }, 
            { ds: '2025-09-21T00:00:00.000Z', y: 150, net_sentiment: 0.85 },
        ],
        forecast: [
            { ds: '2025-09-28T00:00:00.000Z', yhat: 152, yhat_lower: 145, yhat_upper: 159 }, 
            { ds: '2025-10-05T00:00:00.000Z', yhat: 155, yhat_lower: 148, yhat_upper: 162 },
            { ds: '2025-10-12T00:00:00.000Z', yhat: 158, yhat_lower: 150, yhat_upper: 166 }, 
            { ds: '2025-10-19T00:00:00.000Z', yhat: 160, yhat_lower: 152, yhat_upper: 168 },
        ],
        avgSales: 129,
        sentimentTrend: 'positive',
        confidence: 87,
        aiInsight: "Current sentiment for the Harrier is strong and trending upwards. The forecast predicts sustained sales growth. Recommendation: Maintain current production levels and focus marketing on highlighting positive performance and design feedback."
    },
    'Tata Safari': {
        history: [
            { ds: '2025-07-06T00:00:00.000Z', y: 110, net_sentiment: 0.70 }, 
            { ds: '2025-07-13T00:00:00.000Z', y: 115, net_sentiment: 0.72 },
            { ds: '2025-07-20T00:00:00.000Z', y: 112, net_sentiment: 0.65 }, 
            { ds: '2025-07-27T00:00:00.000Z', y: 125, net_sentiment: 0.80 },
            { ds: '2025-08-03T00:00:00.000Z', y: 130, net_sentiment: 0.85 }, 
            { ds: '2025-08-10T00:00:00.000Z', y: 138, net_sentiment: 0.88 },
            { ds: '2025-08-17T00:00:00.000Z', y: 142, net_sentiment: 0.90 }, 
            { ds: '2025-08-24T00:00:00.000Z', y: 145, net_sentiment: 0.92 },
            { ds: '2025-08-31T00:00:00.000Z', y: 148, net_sentiment: 0.94 }, 
            { ds: '2025-09-07T00:00:00.000Z', y: 155, net_sentiment: 0.95 },
            { ds: '2025-09-14T00:00:00.000Z', y: 158, net_sentiment: 0.96 }, 
            { ds: '2025-09-21T00:00:00.000Z', y: 162, net_sentiment: 0.98 },
        ],
        forecast: [
            { ds: '2025-09-28T00:00:00.000Z', yhat: 165, yhat_lower: 158, yhat_upper: 172 }, 
            { ds: '2025-10-05T00:00:00.000Z', yhat: 168, yhat_lower: 160, yhat_upper: 176 },
            { ds: '2025-10-12T00:00:00.000Z', yhat: 172, yhat_lower: 164, yhat_upper: 180 }, 
            { ds: '2025-10-19T00:00:00.000Z', yhat: 175, yhat_lower: 166, yhat_upper: 184 },
        ],
        avgSales: 142,
        sentimentTrend: 'very positive',
        confidence: 94,
        aiInsight: "The Safari shows exceptional positive sentiment, driving a very strong sales forecast. Demand is high. Recommendation: Consider a 5-10% increase in production allocation for the Safari to meet projected demand and capitalize on market leadership."
    }
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl">
                <p className="text-slate-400 text-xs mb-2">{new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-slate-300">{entry.name}:</span>
                        <span className="font-bold text-white">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const StatCard = ({ icon: Icon, label, value, change, trend, subtitle }) => (
    <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <Card className="relative bg-slate-900/60 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
                        <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    {change && (
                        <Badge variant={trend === 'up' ? 'default' : 'destructive'} className={`${trend === 'up' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} flex items-center gap-1`}>
                            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {change}
                        </Badge>
                    )}
                </div>
                <div>
                    <p className="text-sm text-slate-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">{value}</p>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>
            </CardContent>
        </Card>
    </div>
);

const Analytics = ({ region = "Pune" }) => {
    const [selectedCar, setSelectedCar] = useState('Tata Harrier');
    const [isLoading, setIsLoading] = useState(false);
    const [sentimentBoost, setSentimentBoost] = useState(0);

    const { combinedData, baseForecastSum, simulatedForecastSum, upliftPercentage, aiInsight, carData } = useMemo(() => {
        const rawData = forecastAnalysisData[selectedCar];
        if (!rawData) return { combinedData: [], baseForecastSum: 0, simulatedForecastSum: 0, upliftPercentage: 0, aiInsight: "", carData: {} };

        const boostMultiplier = 1 + (sentimentBoost * 0.008);

        const processedForecast = rawData.forecast.map(d => ({
            ...d,
            yhat: d.yhat * boostMultiplier,
            ds: new Date(d.ds).getTime(),
            forecastRange: [d.yhat_lower * boostMultiplier, d.yhat_upper * boostMultiplier]
        }));
        
        const combined = [
            ...rawData.history.map(d => ({ ...d, ds: new Date(d.ds).getTime() })),
            ...processedForecast
        ];

        const baseSum = rawData.forecast.reduce((sum, d) => sum + d.yhat, 0);
        const simulatedSum = processedForecast.reduce((sum, d) => sum + d.yhat, 0);
        const uplift = baseSum > 0 ? ((simulatedSum - baseSum) / baseSum) * 100 : 0;

        let insight = rawData.aiInsight;
        if(sentimentBoost > 10){
            insight = `A +${sentimentBoost}% boost in sentiment could drive a significant sales increase. Recommendation: Launch targeted marketing campaigns focusing on positive user-generated content to achieve this sentiment lift.`;
        } else if (sentimentBoost < -10) {
            insight = `A ${sentimentBoost}% drop in sentiment poses a serious risk to sales projections. Recommendation: Immediately deploy the RAG chatbot to identify the root cause of negative sentiment and assign action items to relevant teams.`;
        }

        return {
            combinedData: combined,
            baseForecastSum: Math.round(baseSum),
            simulatedForecastSum: Math.round(simulatedSum),
            upliftPercentage: uplift.toFixed(1),
            aiInsight: insight,
            carData: rawData
        };

    }, [selectedCar, sentimentBoost]);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    }, [selectedCar]);

    const sentimentData = useMemo(() => {
        return combinedData.filter(d => d.net_sentiment).slice(-8).map(d => ({
            date: new Date(d.ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sentiment: (d.net_sentiment * 100).toFixed(0)
        }));
    }, [combinedData]);

    const unitsDifference = Math.abs(simulatedForecastSum - baseForecastSum);
    const isPositiveUplift = parseFloat(upliftPercentage) >= 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-8">
        <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-8">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                                <Activity className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                    Predictive Analytics
                                </h1>
                                <p className="text-slate-400 text-sm mt-1">
                                    AI-powered forecasting for <span className="font-semibold text-blue-400">{region}</span> region
                                </p>
                            </div>
                        </div>
                    </div>
                    <Select onValueChange={setSelectedCar} value={selectedCar}>
                        <SelectTrigger className="w-full sm:w-[240px] bg-slate-900/60 backdrop-blur-xl border-slate-700/50 text-white hover:border-slate-600/50 transition-all">
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-blue-400" />
                                <SelectValue />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 backdrop-blur-xl border-slate-700 text-white">
                            <SelectItem value="Tata Harrier">Tata Harrier</SelectItem>
                            <SelectItem value="Tata Safari">Tata Safari</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        icon={TrendingUp} 
                        label="Avg Weekly Sales" 
                        value={`${carData.avgSales} units`}
                        change="12.5%"
                        trend="up"
                    />
                    <StatCard 
                        icon={Target} 
                        label="Forecast Accuracy" 
                        value={`${carData.confidence}%`}
                        subtitle="Based on 12-week history"
                    />
                    <StatCard 
                        icon={Sparkles} 
                        label="Sentiment Score" 
                        value={carData.sentimentTrend === 'very positive' ? '98%' : carData.sentimentTrend === 'positive' ? '85%' : '42%'}
                        change={carData.sentimentTrend === 'declining' ? '8.2%' : '5.3%'}
                        trend={carData.sentimentTrend === 'declining' ? 'down' : 'up'}
                    />
                    <StatCard 
                        icon={Zap} 
                        label="12-Week Projection" 
                        value={`${baseForecastSum} units`}
                        subtitle="Without intervention"
                    />
                </div>

                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                    <Card className="relative bg-slate-900/60 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 shadow-2xl">
                        <CardHeader className="border-b border-slate-800/50">
                            <div className="flex items-center text-white justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="p-2 rounded-lg text-white bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                                            <TrendingUp className="w-5 h-5 text-blue-400" />
                                        </div>
                                        Sales Forecast & Sentiment Analysis
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        12-week projection for <span className="font-semibold text-blue-400">{selectedCar}</span> with historical sentiment correlation
                                    </CardDescription>
                                </div>
                                <Badge className="bg-slate-800/50 text-slate-300 border-slate-700/50">
                                    Live Data
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {isLoading ? (
                                <div className="w-full h-[400px] flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                        <p className="text-slate-400 text-sm">Loading analytics...</p>
                                    </div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={400}>
                                    <ComposedChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis 
                                            dataKey="ds" 
                                            stroke="#64748b" 
                                            fontSize={11}
                                            tickFormatter={(t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                                            type="number" 
                                            domain={['dataMin', 'dataMax']}
                                        />
                                        <YAxis 
                                            yAxisId="left" 
                                            stroke="#64748b" 
                                            fontSize={11}
                                            label={{ value: 'Sales (Units)', angle: -90, position: 'insideLeft', fill: '#64748b' }} 
                                        />
                                        <YAxis 
                                            yAxisId="right" 
                                            orientation="right" 
                                            stroke="#8b5cf6" 
                                            fontSize={11}
                                            label={{ value: 'Sentiment Score', angle: 90, position: 'insideRight', fill: '#64748b' }} 
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend 
                                            wrapperStyle={{ paddingTop: '20px' }}
                                            iconType="circle"
                                        />
                                        <Line 
                                            yAxisId="left" 
                                            type="monotone" 
                                            dataKey="y" 
                                            name="Actual Sales" 
                                            stroke="#06b6d4" 
                                            strokeWidth={3}
                                            dot={{ fill: '#06b6d4', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line 
                                            yAxisId="left" 
                                            type="monotone" 
                                            dataKey="yhat" 
                                            name="Forecast" 
                                            stroke="#3b82f6" 
                                            strokeWidth={3}
                                            strokeDasharray="8 4"
                                            dot={false}
                                        />
                                        <Area 
                                            yAxisId="left" 
                                            type="monotone" 
                                            dataKey="forecastRange" 
                                            name="Confidence Interval" 
                                            fill="url(#colorForecast)" 
                                            stroke={false}
                                        />
                                        <Line 
                                            yAxisId="right" 
                                            type="monotone" 
                                            dataKey="net_sentiment" 
                                            name="Sentiment" 
                                            stroke="#8b5cf6" 
                                            strokeWidth={2}
                                            dot={false}
                                            strokeOpacity={0.8}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1  lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl">
                        <CardHeader className="border-b text-white border-slate-800/50">
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                                    <Target className="w-5 h-5 text-emerald-400" />
                                </div>
                                What-If Scenario Simulator
                            </CardTitle>
                            <CardDescription>
                                Adjust sentiment to model potential sales impact
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-slate-300">Sentiment Adjustment</span>
                                        <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${sentimentBoost > 0 ? 'bg-emerald-500/20 text-emerald-400' : sentimentBoost < 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800/50 text-slate-300'}`}>
                                            {sentimentBoost > 0 ? '+' : ''}{sentimentBoost}%
                                        </div>
                                    </div>
                                    <Slider 
                                        value={[sentimentBoost]}
                                        max={20} 
                                        min={-20} 
                                        step={5} 
                                        onValueChange={(v) => setSentimentBoost(v[0])} 
                                        className="cursor-pointer"
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                                        <span>-20%</span>
                                        <span>0%</span>
                                        <span>+20%</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`p-2 rounded-lg ${parseFloat(upliftPercentage) > 0 ? 'bg-emerald-500/20' : parseFloat(upliftPercentage) < 0 ? 'bg-red-500/20' : 'bg-slate-700/30'}`}>
                                                {parseFloat(upliftPercentage) > 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : parseFloat(upliftPercentage) < 0 ? <ArrowDownRight className="w-4 h-4 text-red-400" /> : <Activity className="w-4 h-4 text-slate-400" />}
                                            </div>
                                            <span className="text-sm text-slate-400">Sales Impact</span>
                                        </div>
                                        <div className={`font-bold text-4xl ${parseFloat(upliftPercentage) > 0 ? 'text-emerald-400' : parseFloat(upliftPercentage) < 0 ? 'text-red-400' : 'text-white'}`}>
                                            {parseFloat(upliftPercentage) > 0 ? '+' : ''}{upliftPercentage}%
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            {unitsDifference} units {isPositiveUplift ? 'increase' : 'decrease'}
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 rounded-lg bg-blue-500/20">
                                                <Sparkles className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <span className="text-sm text-slate-400">Projected Sales</span>
                                        </div>
                                        <div className="font-bold text-4xl text-blue-400">
                                            {simulatedForecastSum}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            units over 12 weeks
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 border-blue-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                        <CardHeader className="relative border-b border-blue-500/20">
                            <CardTitle className="flex text-white items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-400/30">
                                    <Brain className="w-5 h-5 text-blue-300" />
                                </div>
                                AI Strategic Insight
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative space-y-4 pt-6">
                            {carData.sentimentTrend === 'declining' && (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-300">Alert: Declining Trend</p>
                                        <p className="text-xs text-red-400/80 mt-1">Immediate action recommended</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="prose prose-sm prose-invert max-w-none">
                                <p className="text-slate-300 leading-relaxed">{aiInsight}</p>
                            </div>

                            <div className="pt-4 space-y-2">
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-300">
                                    <Lightbulb className="mr-2 h-4 w-4" />
                                    Generate Action Plan
                                </Button>
                                <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800/50 text-slate-300">
                                    <Zap className="mr-2 h-4 w-4" />
                                    View Detailed Analysis
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-xl">
                    <CardHeader className="border-b border-slate-800/50">
                        <CardTitle className="flex text-white items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                <Activity className="w-5 h-5 text-purple-400" />
                            </div>
                            Recent Sentiment Trend
                        </CardTitle>
                        <CardDescription>
                            Last 8 weeks of sentiment data for {selectedCar}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={sentimentData}>
                                <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                        border: '1px solid rgba(71, 85, 105, 0.5)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(12px)'
                                    }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    itemStyle={{ color: '#a78bfa' }}
                                />
                                <Bar dataKey="sentiment" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
        </div>
    );
};

export default Analytics;