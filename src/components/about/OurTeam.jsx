
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import axios from 'axios';

const OurTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        console.log('OurTeam - Starting team members fetch...');
        console.log('OurTeam - Backend URL:', import.meta.env.VITE_BACKEND_URL);
        
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/Content/handle_team_members.php`;
        console.log('OurTeam - Full API URL:', apiUrl);
        
        const response = await axios.get(apiUrl);
        console.log('OurTeam - Raw API response:', response);
        console.log('OurTeam - Response data:', response.data);
        console.log('OurTeam - Response data type:', typeof response.data);
        console.log('OurTeam - Response status:', response.status);
        console.log('OurTeam - Response headers:', response.headers);
        
        // Check if response data exists and has expected structure
        if (!response.data) {
          console.error('OurTeam - Response data is null or undefined');
          setError('API returned empty response');
          setTeamMembers([]);
          return;
        }
        
        if (typeof response.data === 'string') {
          console.error('OurTeam - Response data is string (possible HTML error page):', response.data.substring(0, 200));
          setError('API returned invalid response format');
          setTeamMembers([]);
          return;
        }
        
        if (response.data.success) {
          if (response.data.data && response.data.data.length > 0) {
            // Process team members data
            const processedMembers = response.data.data.map(member => ({
              id: member.id,
              name: member.name,
              role: member.role,
              bio: member.bio || '',
              image: member.image_base64 || '/img/default-avatar.webp'
            }));
            setTeamMembers(processedMembers);
            console.log(`OurTeam - Successfully loaded ${processedMembers.length} team members from API`);
            setError(null);
          } else {
            console.log('OurTeam - API returned success but no team members found');
            setTeamMembers([]);
            setError(null);
          }
        } else {
          console.error('OurTeam - API returned error:', response.data.message);
          console.error('OurTeam - Full error response:', response.data);
          setError(response.data.message || 'Failed to load team members');
          setTeamMembers([]);
        }
      } catch (error) {
        console.error('OurTeam - Error fetching team members:', error);
        console.error('OurTeam - Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        
        // Try debug endpoint as fallback
        try {
          console.log('OurTeam - Trying debug endpoint...');
          const debugResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/Content/team_debug.php`);
          console.log('OurTeam - Debug response:', debugResponse.data);
          
          if (debugResponse.data.success) {
            console.log('OurTeam - Debug endpoint works, main API has issues');
            setError('Team members API unavailable - please check database table');
          } else {
            console.log('OurTeam - Debug endpoint also failed');
            setError('Server connectivity issues');
          }
        } catch (debugError) {
          console.error('OurTeam - Debug endpoint also failed:', debugError);
          setError(`Failed to load team members: ${error.message}`);
        }
        
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
        console.log('OurTeam - Fetch completed');
      }
    };

    fetchTeamMembers();
  }, []);

  // Log team members data for debugging
  useEffect(() => {
    if (teamMembers.length > 0) {
      console.log('OurTeam - Team members loaded for marquee:', teamMembers.length);
    }
  }, [teamMembers]);

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our team of dedicated educators and professionals</p>
            <div className="mt-8 animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes scroll-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
          >
            Meet Our Team
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Our team of dedicated educators and professionals
          </motion.p>
        </div>
        
        {/* Horizontal Scrolling Team Members with Marquee */}
        {teamMembers.length > 0 && (
          <div className="relative overflow-hidden">
            <div 
              className="w-full"
              onMouseOver={(e) => {
                console.log('OurTeam - Marquee paused on hover');
                e.currentTarget.style.animationPlayState = 'paused';
              }}
              onMouseOut={(e) => {
                console.log('OurTeam - Marquee resumed');
                e.currentTarget.style.animationPlayState = 'running';
              }}
              style={{
                animation: 'scroll-left 30s linear infinite',
                display: 'flex',
                width: 'fit-content'
              }}
            >
              <div className="flex gap-8 py-4" style={{ display: 'flex', flexShrink: 0 }}>
                {/* First set of team members */}
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={`set1-${member.id || member.name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card rounded-xl border shadow-sm overflow-hidden flex-shrink-0 w-72 md:w-80"
                    style={{ minWidth: '280px' }}
                  >
                    <div className="aspect-square relative">
                      <img 
                        alt={member.name} 
                        className="w-full h-full object-cover" 
                        src={member.image}
                        loading="lazy"
                        onError={(e) => {
                          console.log(`OurTeam - Image load failed for ${member.name}, using default`);
                          e.target.src = '/img/default-avatar.webp';
                        }}
                      />
                    </div>
                    <div className="p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold mb-1 line-clamp-2">{member.name}</h3>
                      <p className="text-indigo-600 dark:text-indigo-400 mb-2 md:mb-3 text-sm md:text-base line-clamp-1">{member.role}</p>
                      <p className="text-muted-foreground text-xs md:text-sm leading-relaxed break-words whitespace-normal">{member.bio}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-8 py-4" style={{ display: 'flex', flexShrink: 0 }}>
                {/* Second set for continuous scroll */}
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={`set2-${member.id || member.name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-card rounded-xl border shadow-sm overflow-hidden flex-shrink-0 w-72 md:w-80"
                    style={{ minWidth: '280px' }}
                  >
                    <div className="aspect-square relative">
                      <img 
                        alt={member.name} 
                        className="w-full h-full object-cover" 
                        src={member.image}
                        loading="lazy"
                        onError={(e) => {
                          console.log(`OurTeam - Image load failed for ${member.name}, using default`);
                          e.target.src = '/img/default-avatar.webp';
                        }}
                      />
                    </div>
                    <div className="p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold mb-1 line-clamp-2">{member.name}</h3>
                      <p className="text-indigo-600 dark:text-indigo-400 mb-2 md:mb-3 text-sm md:text-base line-clamp-1">{member.role}</p>
                      <p className="text-muted-foreground text-xs md:text-sm leading-relaxed break-words whitespace-normal">{member.bio}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Gradient overlays for seamless infinite scroll effect */}
            <div className="absolute top-0 left-0 w-8 md:w-16 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
            <div className="absolute top-0 right-0 w-8 md:w-16 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
          </div>
        )}
        
        {/* Error message or empty state */}
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">Unable to load team members</p>
              <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {!error && teamMembers.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">No team members found</p>
              <p className="text-blue-500 dark:text-blue-300 text-sm">Team members will appear here once they are added.</p>
            </div>
          </div>
        )}
      </div>
    </section>
    </>
  );
};
export default OurTeam;
