import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// UI Components & Recharts
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar, CartesianGrid } from 'recharts';
import { Car, Flag, Download, TrendingUp, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

// --- Data Hardcoded from Analysis of Your JSON Files (Pune Region) ---
const dashboardData = {
    'Tata Harrier': {
        kpis: { totalMentions: 482, netSentiment: 68, positive: 351, negative: 69 },
        sentimentTrend: [
            { month: 'Apr', positive: 50, negative: 10 }, 
            { month: 'May', positive: 65, negative: 12 },
            { month: 'Jun', positive: 55, negative: 18 }, 
            { month: 'Jul', positive: 72, negative: 8 },
            { month: 'Aug', positive: 80, negative: 15 }, 
            { month: 'Sep', positive: 78, negative: 6 },
        ],
        aspectSentiment: [
            { aspect: 'Performance', score: 85 }, 
            { aspect: 'Design', score: 92 },
            { aspect: 'Comfort', score: 78 }, 
            { aspect: 'Infotainment', score: 35 },
            { aspect: 'Service', score: 15 }, 
            { aspect: 'Safety', score: 95 },
        ],
        competitorComparison: [
            { subject: 'Performance', A: 85, B: 80, fullMark: 100 }, 
            { subject: 'Features', A: 70, B: 85, fullMark: 100 },
            { subject: 'Safety', A: 95, B: 90, fullMark: 100 }, 
            { subject: 'Value', A: 88, B: 82, fullMark: 100 },
            { subject: 'Service', A: 60, B: 75, fullMark: 100 },
        ],
        urgentAlerts: [
            { 
                id: 'H01', 
                user: '@harrier_hues', 
                text: "The infotainment screen on my Harrier Dark Edition is completely unresponsive after the latest update. Service center in Wakad has no solution." 
            },
        ]
    },
    'Tata Safari': {
        kpis: { totalMentions: 391, netSentiment: 82, positive: 310, negative: 31 },
        sentimentTrend: [
            { month: 'Apr', positive: 45, negative: 5 }, 
            { month: 'May', positive: 50, negative: 8 },
            { month: 'Jun', positive: 60, negative: 4 }, 
            { month: 'Jul', positive: 68, negative: 2 },
            { month: 'Aug', positive: 75, negative: 9 }, 
            { month: 'Sep', positive: 85, negative: 3 },
        ],
        aspectSentiment: [
            { aspect: 'Performance', score: 90 }, 
            { aspect: 'Design', score: 88 },
            { aspect: 'Comfort', score: 94 }, 
            { aspect: 'Infotainment', score: 25 },
            { aspect: 'Service', score: 10 }, 
            { aspect: 'Safety', score: 96 },
        ],
        competitorComparison: [
            { subject: 'Performance', A: 90, B: 88, fullMark: 100 }, 
            { subject: 'Features', A: 80, B: 92, fullMark: 100 },
            { subject: 'Safety', A: 96, B: 90, fullMark: 100 }, 
            { subject: 'Value', A: 85, B: 80, fullMark: 100 },
            { subject: 'Service', A: 65, B: 75, fullMark: 100 },
        ],
        urgentAlerts: [
            { 
                id: 'S01', 
                user: '@safari_stories', 
                text: "Third-row AC vents on my Safari Adventure+ are barely functional. It's a major issue in this heat. Reported at Baner dealership." 
            },
        ]
    }
};

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

// --- 3D INTERACTIVE CHART COMPONENT ---
const AspectSentimentChart3D = ({ data }) => {
    const mountRef = useRef(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x020617, 10, 30);
        
        const camera = new THREE.PerspectiveCamera(
            60, 
            currentMount.clientWidth / currentMount.clientHeight, 
            0.1, 
            1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        currentMount.appendChild(renderer.domElement);

        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        const pointLight1 = new THREE.PointLight(0x3b82f6, 1, 20);
        pointLight1.position.set(-5, 5, 5);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x8b5cf6, 1, 20);
        pointLight2.position.set(5, 5, -5);
        scene.add(pointLight2);

        // Grid floor with glow
        const gridSize = 20;
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x3b82f6, 0x1e293b);
        gridHelper.position.y = -0.1;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Create glowing platform
        const platformGeometry = new THREE.CircleGeometry(8, 32);
        const platformMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x1e293b, 
            transparent: true, 
            opacity: 0.2,
            side: THREE.DoubleSide 
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.rotation.x = -Math.PI / 2;
        platform.position.y = -0.05;
        scene.add(platform);

        const bars = new THREE.Group();
        const barWidth = 1;
        const spacing = 2.5;
        const maxHeight = 6;
        
        // Create scale indicators
        for (let i = -100; i <= 100; i += 50) {
            const lineGeometry = new THREE.BufferGeometry();
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0x475569, 
                transparent: true, 
                opacity: 0.3 
            });
            const yPos = (i / 100) * (maxHeight / 2);
            lineGeometry.setFromPoints([
                new THREE.Vector3(-10, yPos, 0),
                new THREE.Vector3(10, yPos, 0)
            ]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
        }
        
        data.forEach((item, index) => {
            // Calculate height based on score
            const height = (Math.abs(item.score) / 100) * maxHeight;
            const yPosition = item.score >= 0 ? height / 2 : -height / 2;
            
            // Create bar with rounded edges
            const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
            
            // Color gradient based on score
            let color;
            if (item.score >= 70) color = new THREE.Color(0x10b981); // Emerald
            else if (item.score >= 30) color = new THREE.Color(0x22c55e); // Green
            else if (item.score >= 0) color = new THREE.Color(0x84cc16); // Lime
            else if (item.score >= -30) color = new THREE.Color(0xf59e0b); // Amber
            else if (item.score >= -70) color = new THREE.Color(0xf97316); // Orange
            else color = new THREE.Color(0xef4444); // Red
            
            const material = new THREE.MeshPhysicalMaterial({ 
                color, 
                transparent: true, 
                opacity: 0.85,
                metalness: 0.5,
                roughness: 0.2,
                clearcoat: 1,
                clearcoatRoughness: 0.1,
                reflectivity: 0.9
            });
            
            const bar = new THREE.Mesh(geometry, material);
            bar.position.set((index - (data.length - 1) / 2) * spacing, yPosition, 0);
            bar.castShadow = true;
            bar.receiveShadow = true;
            bar.userData = { 
                aspect: item.aspect, 
                score: item.score,
                initialY: yPosition,
                initialOpacity: 0.85
            };
            
            // Add edge glow
            const edgesGeometry = new THREE.EdgesGeometry(geometry);
            const edgesMaterial = new THREE.LineBasicMaterial({ 
                color: color.clone().multiplyScalar(1.5), 
                transparent: true, 
                opacity: 0.6 
            });
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            bar.add(edges);
            
            bars.add(bar);
        });
        scene.add(bars);

        camera.position.set(0, 4, 12);
        camera.lookAt(0, 0, 0);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = true;
        controls.minDistance = 8;
        controls.maxDistance = 20;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.2;
        controls.maxPolarAngle = Math.PI / 2;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let intersected;
        let animationId;

        const onMouseMove = (event) => {
            if (mountRef.current && tooltipRef.current) {
                const rect = mountRef.current.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                tooltipRef.current.style.left = `${event.clientX + 15}px`;
                tooltipRef.current.style.top = `${event.clientY + 15}px`;
            }
        };
        
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            controls.update();
            
            // Animate point lights
            const time = Date.now() * 0.001;
            pointLight1.position.x = Math.sin(time * 0.5) * 5;
            pointLight1.position.z = Math.cos(time * 0.5) * 5;
            pointLight2.position.x = Math.cos(time * 0.7) * 5;
            pointLight2.position.z = Math.sin(time * 0.7) * 5;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(bars.children);

            if (intersects.length > 0) {
                if (intersected !== intersects[0].object) {
                    if (intersected) {
                        intersected.material.opacity = intersected.userData.initialOpacity;
                        intersected.position.y = intersected.userData.initialY;
                        intersected.scale.set(1, 1, 1);
                    }
                    intersected = intersects[0].object;
                    intersected.material.opacity = 1.0;
                    intersected.position.y = intersected.userData.initialY + 0.3;
                    intersected.scale.set(1.1, 1.1, 1.1);
                    controls.autoRotate = false;
                    
                    if(tooltipRef.current){
                        tooltipRef.current.style.display = 'block';
                        const scoreColor = intersected.userData.score >= 0 ? '#10b981' : '#ef4444';
                        tooltipRef.current.innerHTML = `
                            <div class="font-bold text-lg mb-1">${intersected.userData.aspect}</div>
                            <div class="text-sm" style="color: ${scoreColor}">
                                Score: <span class="font-bold text-xl">${intersected.userData.score > 0 ? '+' : ''}${intersected.userData.score}</span>
                            </div>
                            <div class="text-xs text-slate-400 mt-1">
                                ${intersected.userData.score >= 0 ? '✓ Positive Sentiment' : '⚠ Needs Attention'}
                            </div>
                        `;
                    }
                }
            } else {
                if (intersected) {
                    intersected.material.opacity = intersected.userData.initialOpacity;
                    intersected.position.y = intersected.userData.initialY;
                    intersected.scale.set(1, 1, 1);
                    controls.autoRotate = true;
                }
                intersected = null;
                if(tooltipRef.current) {
                    tooltipRef.current.style.display = 'none';
                }
            }
            
            renderer.render(scene, camera);
        };
        
        window.addEventListener('mousemove', onMouseMove);
        animate();
        
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationId);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            renderer.dispose();
        };
    }, [data]);

    return (
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden rounded-lg">
            <div 
                ref={tooltipRef} 
                className="absolute bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl border-2 border-blue-500/50 pointer-events-none z-10 shadow-2xl shadow-blue-500/20" 
                style={{ display: 'none' }}
            ></div>
            <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-900/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50">
                <p>🖱️ Drag to rotate • 🔍 Scroll to zoom • ✨ Hover bars for details</p>
            </div>
        </div>
    );
};


export default function LocalDealerDashboard({ user }) {
    const [selectedCar, setSelectedCar] = useState('Tata Harrier');
    const [data, setData] = useState(dashboardData[selectedCar]);
    const [isDownloading, setIsDownloading] = useState(false);
    const navigate = useNavigate();
    const dashboardRef = useRef(null);

    useEffect(() => {
        setData(dashboardData[selectedCar]);
    }, [selectedCar]);

    const handleDownload = () => {
        setIsDownloading(true);
        const dashboardElement = dashboardRef.current;
        html2canvas(dashboardElement, { 
            backgroundColor: '#020617', 
            useCORS: true 
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ 
                orientation: 'landscape', 
                unit: 'px', 
                format: [canvas.width, canvas.height] 
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`TataVision_Dashboard_${selectedCar.replace(' ','_')}_${new Date().toLocaleDateString()}.pdf`);
            setIsDownloading(false);
        });
    };
    
    const handleDiscuss = (alert) => {
        const prefilledMessage = `Hi, I need to discuss a critical issue regarding a ${selectedCar}.\n\nCustomer: ${alert.user}\nIssue: "${alert.text}"\n\nPlease advise on the next steps.`;
        navigate('/chatpage', { state: { prefilledMessage } });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 pt-28" ref={dashboardRef}>
            <div className="mt-20 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dealer Dashboard</h1>
                    <p className="text-slate-400">
                        Live sentiment analysis for <span className="font-bold text-blue-400">{user?.location || 'your region'}</span>.
                    </p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <Select onValueChange={setSelectedCar} defaultValue={selectedCar}>
                        <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
                            <Car className="mr-2 h-4 w-4" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-slate-700">
                            <SelectItem value="Tata Harrier">Tata Harrier</SelectItem>
                            <SelectItem value="Tata Safari">Tata Safari</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={handleDownload} 
                        disabled={isDownloading} 
                        variant="outline" 
                        className="bg-slate-900 border-slate-700 hover:bg-slate-800"
                    >
                        <Download className="mr-2 h-4 w-4"/>
                        {isDownloading ? 'Generating...' : 'Download Report'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-400 flex items-center gap-2">
                            <MessageSquare size={18}/>Total Mentions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl text-white font-bold">{data.kpis.totalMentions}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-400 flex items-center gap-2">
                            <TrendingUp size={18}/>Net Sentiment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl  font-bold ${data.kpis.netSentiment > 0 ? 'text-emerald-400':'text-red-400'}`}>
                            {data.kpis.netSentiment > 0 ? '+':''}{data.kpis.netSentiment}%
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-400 flex items-center gap-2">
                            <ThumbsUp size={18}/>Positive Posts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl text-white font-bold">{data.kpis.positive}</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-400 flex items-center gap-2">
                            <ThumbsDown size={18}/>Negative Posts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl text-white font-bold">{data.kpis.negative}</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/80 text-white backdrop-blur-sm border-slate-800">
                    <CardHeader>
                        <CardTitle>Aspect Sentiment Analysis</CardTitle>
                        <CardDescription>
                            3D view of customer sentiment by feature for the {selectedCar}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <Suspense fallback={<Skeleton className="h-full w-full bg-slate-800"/>}>
                            <AspectSentimentChart3D data={data.aspectSentiment} />
                        </Suspense>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-900/80 text-white backdrop-blur-sm border-slate-800">
                    <CardHeader>
                        <CardTitle>Sentiment Trend (Last 6 Months)</CardTitle>
                        <CardDescription>
                            Positive vs. Negative mentions for the {selectedCar}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={data.sentimentTrend}>
                                <CartesianGrid stroke="#374151" strokeDasharray="3 3"/>
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="positive" 
                                    name="Positive" 
                                    stroke="#22c55e" 
                                    strokeWidth={2} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="negative" 
                                    name="Negative" 
                                    stroke="#ef4444" 
                                    strokeWidth={2} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 text-white bg-slate-900/80 backdrop-blur-sm border-slate-800">
                     <CardHeader>
                        <CardTitle>Competitor Benchmark: {selectedCar} vs. XUV700</CardTitle>
                        <CardDescription>
                            How key aspects compare against the main competitor in Pune.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-[350px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.competitorComparison}>
                                    <defs>
                                        <linearGradient id="tataGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                    <PolarGrid stroke="#4b5563"/>
                                    <PolarAngleAxis dataKey="subject" stroke="#e5e7eb"/>
                                    <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #4b5563'}}/>
                                    <Radar 
                                        name={selectedCar} 
                                        dataKey="A" 
                                        stroke="url(#tataGradient)" 
                                        fill="url(#tataGradient)" 
                                        fillOpacity={0.6} 
                                    />
                                    <Radar 
                                        name="XUV700" 
                                        dataKey="B" 
                                        stroke="#a855f7" 
                                        fill="#a855f7" 
                                        fillOpacity={0.4} 
                                    />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                            <CardTitle>Urgent Action Alerts</CardTitle>
                            {data.urgentAlerts.map(alert => (
                                <div 
                                    key={alert.id} 
                                    className="p-4 rounded-lg border border-red-500/30 bg-red-900/20"
                                >
                                    <p className="font-bold text-red-300">{alert.user}</p>
                                    <p className="text-slate-300 text-sm mt-1">{alert.text}</p>
                                    <Button 
                                        onClick={() => handleDiscuss(alert)} 
                                        size="sm" 
                                        variant="destructive" 
                                        className="mt-3 text-xs h-8"
                                    >
                                        <Flag className="mr-2 h-3 w-3"/>
                                        Discuss with Executive
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}