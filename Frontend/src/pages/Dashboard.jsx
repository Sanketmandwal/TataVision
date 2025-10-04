import React, { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, MessageSquare, TrendingUp, UserCheck, Car, AlertTriangle, ThumbsUp, MapPin } from 'lucide-react';
import { addDays, format } from "date-fns";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


const kpiData = {
  totalMentions: "1.2M",
  positivePercentage: 82,
  netSentiment: 65,
  topMentionedModel: "Nexon EV"
};

const sentimentData = [
  { name: 'Wk 1', Positive: 4000, Negative: 2400 },
  { name: 'Wk 2', Positive: 3000, Negative: 1398 },
  { name: 'Wk 3', Positive: 2000, Negative: 9800 },
  { name: 'Wk 4', Positive: 2780, Negative: 3908 },
  { name: 'Wk 5', Positive: 1890, Negative: 4800 },
  { name: 'Wk 6', Positive: 2390, Negative: 3800 },
  { name: 'Wk 7', Positive: 3490, Negative: 4300 },
];

const modelSentimentData = [
  { name: 'Nexon EV', sentiment: 85 },
  { name: 'Harrier', sentiment: 62 },
  { name: 'Safari', sentiment: 75 },
  { name: 'Punch', sentiment: 45 },
  { name: 'Altroz', sentiment: 32 },
];

const regionalData = [
    { region: 'Maharashtra', sentiment: 92 },
    { region: 'Delhi NCR', sentiment: 85 },
    { region: 'Karnataka', sentiment: 78 },
    { region: 'Tamil Nadu', sentiment: 65 },
    { region: 'Gujarat', sentiment: 55 },
];

const recentMentions = [
    { id: 1, user: "@ev_enthusiast", text: "The range on the new Nexon EV is just insane! Easily getting 400km on a single charge. Tata has nailed it.", sentiment: 'positive', model: "Nexon EV" },
    { id: 2, user: "@CarCritics", text: "While the Harrier looks stunning, the infotainment system still feels a bit laggy compared to the competition. Needs a software update.", sentiment: 'negative', model: "Harrier" },
    { id: 3, user: "@SafetyFirst", text: "Just saw the 5-star GNCAP rating for the Punch. Incredible to see such a safe car at this price point. Well done, Tata!", sentiment: 'positive', model: "Punch" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm text-white p-3 rounded-lg border border-slate-700">
        <p className="font-bold text-slate-300">{label}</p>
        <p className="text-emerald-400">{`Positive: ${payload[0].value}`}</p>
        <p className="text-red-400">{`Negative: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [date, setDate] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 pt-28">
      {/* Header */}
      <div  className="flex flex-col mt-20 sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your real-time sentiment overview.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[280px] justify-start text-left font-normal bg-slate-900 border-slate-800 hover:bg-slate-800 hover:text-white"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800 text-white" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Mentions</CardTitle>
            <MessageSquare className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-white font-bold">{kpiData.totalMentions}</div>
            <p className="text-xs text-slate-500">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white border-slate-800 hover:border-emerald-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Positive Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className=" text-white text-2xl font-bold">{kpiData.positivePercentage}%</div>
            <p className="text-xs text-slate-500">+3.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white border-slate-800 hover:border-purple-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Net Sentiment Score</CardTitle>
            <UserCheck className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{kpiData.netSentiment}</div>
            <p className="text-xs text-slate-500">Overall positive perception</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white border-slate-800 hover:border-orange-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Top Mentioned Model</CardTitle>
            <Car className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.topMentionedModel}</div>
            <p className="text-xs text-slate-500">Most discussed vehicle</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle>Sentiment Overview</CardTitle>
            <CardDescription>Positive vs. Negative mentions over time.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={sentimentData}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Positive" stroke="#10b981" fillOpacity={1} fill="url(#colorPositive)" />
                <Area type="monotone" dataKey="Negative" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNegative)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle>Sentiment by Model</CardTitle>
            <CardDescription>Net sentiment score per vehicle.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={modelSentimentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={60} />
                <Tooltip cursor={{fill: '#374151'}} contentStyle={{backgroundColor: '#1f2937', border: '1px solid #4b5563', color: 'white'}}/>
                <Bar dataKey="sentiment" fill="url(#colorBar)" background={{ fill: '#374151' }} barSize={20}>
                   <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                   </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Regional & Recent Mentions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-1 bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle>Regional Hotspots</CardTitle>
            <CardDescription>Top 5 regions by sentiment.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                 {regionalData.map(item => (
                     <div key={item.region}>
                         <div className="flex justify-between mb-1">
                             <span className="text-sm font-medium text-slate-300">{item.region}</span>
                             <span className="text-sm font-medium text-blue-400">{item.sentiment}%</span>
                         </div>
                         <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${item.sentiment}%`}}></div>
                         </div>
                     </div>
                 ))}
             </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle>Recent High-Impact Mentions</CardTitle>
            <CardDescription>Latest positive and negative feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMentions.map(mention => (
                <div key={mention.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-800/50">
                  <Avatar>
                    <AvatarFallback className={mention.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                      {mention.sentiment === 'positive' ? <ThumbsUp className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{mention.user}</p>
                        <Badge variant="outline" className="border-slate-700 text-slate-400">{mention.model}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">{mention.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
