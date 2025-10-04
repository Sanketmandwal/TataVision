import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// UI Components & Recharts
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Car, Flag, Send, TrendingUp, ThumbsUp, ThumbsDown, MessageSquare, Minus, TrendingDown, Sparkles } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';

// --- Hardcoded Data Synthesized from Your Datasets ---
const executiveData = {
    'All Models': {
        kpis: { totalMentions: "8.7k", netSentiment: 75, positive: "6.8k", negative: "1.1k" },
        regionalPerformance: [
            { region: "Bangalore", netSentiment: 92, openIssues: 0, trend: 'up' },
            { region: "Delhi NCR", netSentiment: 85, openIssues: 2, trend: 'up' },
            { region: "Pune", netSentiment: 78, openIssues: 1, trend: 'stable' },
            { region: "Mumbai", netSentiment: 65, openIssues: 5, trend: 'down' },
            { region: "Chennai", netSentiment: 55, openIssues: 8, trend: 'down' },
        ],
        dealerIssues: [
            { id: 'ISS01', region: "Mumbai", car: "Harrier", issue: "Multiple customer complaints about infotainment system lag.", status: 'New', reportedBy: "Mumbai South Dealer" },
            { id: 'ISS02', region: "Chennai", car: "Harrier", issue: "Customers reporting inconsistent panel gaps on new deliveries.", status: 'New', reportedBy: "Chennai City Dealer" },
            { id: 'ISS03', region: "Delhi NCR", car: "Safari", issue: "Long waiting periods for spare parts at service centers.", status: 'Acknowledged', reportedBy: "Delhi Central Dealer" },
        ],
        aspectSentiment: [
            { aspect: 'Performance', score: 88 }, { aspect: 'Design', score: 90 },
            { aspect: 'Comfort', score: 86 }, { aspect: 'Infotainment', score: -5 },
            { aspect: 'Service', score: -2 }, { aspect: 'Safety', score: 95 },
        ]
    },
    'Tata Harrier': {
        kpis: { totalMentions: "4.8k", netSentiment: 68, positive: "3.5k", negative: "0.7k" },
        regionalPerformance: [
            { region: "Bangalore", netSentiment: 88, openIssues: 0, trend: 'up' },
            { region: "Delhi NCR", netSentiment: 82, openIssues: 1, trend: 'up' },
            { region: "Pune", netSentiment: 80, openIssues: 1, trend: 'stable' },
            { region: "Mumbai", netSentiment: 60, openIssues: 3, trend: 'down' },
            { region: "Chennai", netSentiment: 50, openIssues: 4, trend: 'down' },
        ],
        dealerIssues: [
            { id: 'ISS01', region: "Mumbai", car: "Harrier", issue: "Multiple customer complaints about infotainment system lag.", status: 'New', reportedBy: "Mumbai South Dealer" },
            { id: 'ISS02', region: "Chennai", car: "Harrier", issue: "Customers reporting inconsistent panel gaps on new deliveries.", status: 'New', reportedBy: "Chennai City Dealer" },
        ],
        aspectSentiment: [
            { aspect: 'Performance', score: 85 }, { aspect: 'Design', score: 92 },
            { aspect: 'Comfort', score: 78 }, { aspect: 'Infotainment', score: 35 },
            { aspect: 'Service', score: -15 }, { aspect: 'Safety', score: 95 },
        ]
    },
    'Tata Safari': {
        kpis: { totalMentions: "3.9k", netSentiment: 82, positive: "3.3k", negative: "0.4k" },
        regionalPerformance: [
            { region: "Bangalore", netSentiment: 95, openIssues: 0, trend: 'up' },
            { region: "Delhi NCR", netSentiment: 88, openIssues: 1, trend: 'up' },
            { region: "Pune", netSentiment: 85, openIssues: 0, trend: 'stable' },
            { region: "Mumbai", netSentiment: 70, openIssues: 2, trend: 'stable' },
            { region: "Chennai", netSentiment: 60, openIssues: 4, trend: 'down' },
        ],
        dealerIssues: [
            { id: 'ISS03', region: "Delhi NCR", car: "Safari", issue: "Long waiting periods for spare parts at service centers.", status: 'Acknowledged', reportedBy: "Delhi Central Dealer" },
        ],
        aspectSentiment: [
            { aspect: 'Performance', score: 90 }, { aspect: 'Design', score: 88 },
            { aspect: 'Comfort', score: 94 }, { aspect: 'Infotainment', score: 25 },
            { aspect: 'Service', score: 10 }, { aspect: 'Safety', score: 96 },
        ]
    }
};

// --- 3D INTERACTIVE CHART COMPONENT (ENHANCED) ---
const AspectSentimentChart3D = ({ data }) => {
    const mountRef = useRef(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;
        
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

        // Grid floor
        const gridSize = 20;
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x3b82f6, 0x1e293b);
        gridHelper.position.y = -0.1;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Glowing platform
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
        
        // Scale indicators
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
            const height = (Math.abs(item.score) / 100) * maxHeight;
            const yPosition = item.score >= 0 ? height / 2 : -height / 2;
            
            const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
            
            // Color gradient based on score
            let color;
            if (item.score >= 70) color = new THREE.Color(0x10b981);
            else if (item.score >= 30) color = new THREE.Color(0x22c55e);
            else if (item.score >= 0) color = new THREE.Color(0x84cc16);
            else if (item.score >= -30) color = new THREE.Color(0xf59e0b);
            else if (item.score >= -70) color = new THREE.Color(0xf97316);
            else color = new THREE.Color(0xef4444);
            
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
            
            // Edge glow
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
        const mouse = new THREE.Vector2(-Infinity, -Infinity);
        let intersected;
        let animationId;

        const onMouseMove = (event) => {
            if (currentMount && tooltipRef.current) {
                const rect = currentMount.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                tooltipRef.current.style.left = `${event.clientX + 15}px`;
                tooltipRef.current.style.top = `${event.clientY + 15}px`;
            }
        };

        const onMouseLeave = () => {
            mouse.set(-Infinity, -Infinity);
            if (intersected) {
                intersected.material.opacity = intersected.userData.initialOpacity;
                intersected.position.y = intersected.userData.initialY;
                intersected.scale.set(1, 1, 1);
                controls.autoRotate = true;
            }
            intersected = null;
            if(tooltipRef.current) tooltipRef.current.style.display = 'none';
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
                if(tooltipRef.current) tooltipRef.current.style.display = 'none';
            }
            
            renderer.render(scene, camera);
        };

        currentMount.addEventListener('mousemove', onMouseMove);
        currentMount.addEventListener('mouseleave', onMouseLeave);
        animate();

        return () => {
            currentMount.removeEventListener('mousemove', onMouseMove);
            currentMount.removeEventListener('mouseleave', onMouseLeave);
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
        <div className="w-full h-full relative">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden rounded-lg"></div>
            <div 
                ref={tooltipRef} 
                className="fixed bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl border-2 border-blue-500/50 pointer-events-none z-10 shadow-2xl shadow-blue-500/20" 
                style={{ display: 'none' }}
            ></div>
            <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-900/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50">
                <p>🖱️ Drag to rotate • 🔍 Scroll to zoom • ✨ Hover bars for details</p>
            </div>
        </div>
    );
};


export default function SalesExecutiveDashboard({ user }) {
    const [selectedCar, setSelectedCar] = useState('All Models');
    const [data, setData] = useState(executiveData[selectedCar]);
    const navigate = useNavigate();

    useEffect(() => {
        setData(executiveData[selectedCar]);
    }, [selectedCar]);
    
    const handleDiscuss = (issue) => {
        const prefilledMessage = `Regarding the issue reported from ${issue.region} for the ${issue.car}:\n\n"${issue.issue}"\n\nWhat is the current status and proposed action plan?`;
        navigate('/chat', { state: { prefilledMessage, contactName: issue.reportedBy } });
    };

    const TrendIcon = ({ trend }) => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-400" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-400" />;
        return <Minus className="h-4 w-4 text-slate-400" />;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 pt-28">
            <div className="flex mt-20 flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-blue-400" />
                        Sales Executive Overview
                    </h1>
                    <p className="text-slate-400 mt-1">Aggregated national sentiment and dealer issues.</p>
                </div>
                <Select onValueChange={setSelectedCar} defaultValue={selectedCar}>
                    <SelectTrigger className="w-full sm:w-[220px] mt-4 sm:mt-0 bg-slate-900 border-slate-700 text-white hover:border-blue-500/50 transition-colors">
                        <Car className="mr-2 h-4 w-4" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-slate-700">
                        <SelectItem value="All Models">All Models</SelectItem>
                        <SelectItem value="Tata Harrier">Tata Harrier</SelectItem>
                        <SelectItem value="Tata Safari">Tata Safari</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* KPI Cards with gradient backgrounds */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                    <CardHeader>
                        <CardTitle className="text-slate-400 flex items-center gap-2">
                            <MessageSquare size={18} className="text-blue-400"/>
                            Total Mentions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {data.kpis.totalMentions}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                    <CardHeader>
                        <CardTitle className="text-slate-400 flex items-center gap-2">
                            <TrendingUp size={18} className="text-emerald-400"/>
                            Net Sentiment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl font-bold ${data.kpis.netSentiment > 0 ? 'text-emerald-400':'text-red-400'}`}>
                            {data.kpis.netSentiment > 0 ? '+':''}{data.kpis.netSentiment}%
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                    <CardHeader>
                        <CardTitle className="text-slate-400 flex items-center gap-2">
                            <ThumbsUp size={18} className="text-green-400"/>
                            Positive Posts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-400">{data.kpis.positive}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20">
                    <CardHeader>
                        <CardTitle className="text-slate-400 flex items-center gap-2">
                            <ThumbsDown size={18} className="text-red-400"/>
                            Negative Posts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-400">{data.kpis.negative}</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Regional Performance Table */}
                <div className="lg:col-span-3">
                    <Card className="bg-slate-900/80 backdrop-blur-sm text-white border-slate-800 hover:border-blue-500/30 transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="h-2 w-2 text-white bg-blue-400 rounded-full animate-pulse"></div>
                                Regional Performance Snapshot
                            </CardTitle>
                            <CardDescription>Comparison of key metrics for: {selectedCar}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                        <TableHead className="text-white font-semibold">Region</TableHead>
                                        <TableHead className="text-white font-semibold">Net Sentiment</TableHead>
                                        <TableHead className="text-white font-semibold">Open Issues</TableHead>
                                        <TableHead className="text-white font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.regionalPerformance.map((r, idx) => (
                                        <TableRow 
                                            key={r.region} 
                                            className="border-slate-800 hover:bg-slate-800/50 transition-colors"
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${
                                                        r.netSentiment > 80 ? 'bg-emerald-400' : 
                                                        r.netSentiment > 60 ? 'bg-yellow-400' : 
                                                        'bg-red-400'
                                                    }`}></div>
                                                    {r.region}
                                                    <TrendIcon trend={r.trend} />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="outline" 
                                                    className={`font-bold border-2 ${
                                                        r.netSentiment > 80 ? 'border-emerald-400/50 text-emerald-400 bg-emerald-400/10' : 
                                                        r.netSentiment > 60 ? 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10' : 
                                                        'border-orange-400/50 text-orange-400 bg-orange-400/10'
                                                    }`}
                                                >
                                                    {r.netSentiment}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={r.openIssues > 3 ? 'destructive' : 'secondary'}
                                                    className="font-bold"
                                                >
                                                    {r.openIssues} {r.openIssues === 1 ? 'Issue' : 'Issues'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-black">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all"
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                
                {/* 3D Chart */}
                <div className="lg:col-span-2">
                    <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-purple-500/30 transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-400" />
                                National Aspect Sentiment
                            </CardTitle>
                            <CardDescription>Aggregated 3D view for the {selectedCar}.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <Suspense fallback={<Skeleton className="h-full w-full bg-slate-800 animate-pulse"/>}>
                                <AspectSentimentChart3D data={data.aspectSentiment} />
                            </Suspense>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Dealer Issues Section */}
                <div className="lg:col-span-5">
                    <Card className="bg-slate-900/80 backdrop-blur-sm text-white border-slate-800 hover:border-red-500/30 transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Flag className="text-red-400 animate-pulse"/>
                                Incoming Dealer Issues
                            </CardTitle>
                            <CardDescription>Actionable reports that require your attention.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.dealerIssues.map((issue, idx) => (
                                <div 
                                    key={issue.id} 
                                    className="p-5 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-2 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="font-bold text-white text-lg">
                                                    {issue.region}
                                                </p>
                                                <span className="text-slate-500">•</span>
                                                <span className="text-blue-400 font-semibold">{issue.car}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-3 flex items-center gap-2">
                                                <MessageSquare className="h-3 w-3" />
                                                Reported by: <span className="text-slate-400 font-medium">{issue.reportedBy}</span>
                                            </p>
                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                                <p className="text-sm text-slate-300 leading-relaxed">{issue.issue}</p>
                                            </div>
                                        </div>
                                        <Badge 
                                            variant={issue.status === 'New' ? 'destructive' : 'secondary'}
                                            className="ml-4 font-semibold"
                                        >
                                            {issue.status}
                                        </Badge>
                                    </div>
                                    <div className="flex text-black gap-3 mt-4">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="flex-1 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                                        >
                                            <ThumbsUp className="mr-2 h-3 w-3"/>
                                            Acknowledge
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    size="sm" 
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/20 transition-all"
                                                >
                                                    <Send className="mr-2 h-3 w-3"/>
                                                    Send Suggestion
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-xl">
                                                        Send Suggestion to {issue.reportedBy}
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="text-slate-400 mt-2">
                                                        Provide actionable advice or a solution to the dealer regarding this issue.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="my-4">
                                                    <Textarea 
                                                        placeholder="E.g., 'Prioritize software updates for infotainment issues. Schedule immediate technical training for service staff...'" 
                                                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[120px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-slate-800 border-slate-700 hover:bg-slate-700">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600">
                                                        Send Message
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}