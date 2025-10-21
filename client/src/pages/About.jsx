import React from 'react';
import { Box, Container, Typography, Divider, useTheme } from '@mui/material';

const About = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        py: 0,
      bgcolor: 'background.default',
        minHeight: '100vh',
        color: 'text.primary',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {/* Banner Section */}
      <section
        className="relative w-full h-40 md:h-56 flex items-center justify-center overflow-hidden rounded-b-lg shadow mb-10"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #181c24 0%, #23272f 100%)'
            : 'linear-gradient(180deg, #fff 0%, #f8f9fa 100%)',
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80"
          alt="Paws & Claws Marketplace Banner"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
          loading="eager"
          style={{ filter: isDark ? 'brightness(0.6)' : undefined }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, #23272fbb 0%, #181c24cc 100%)'
              : 'linear-gradient(90deg, #fbc2eb99 0%, #a6c1ee99 100%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
          <h1
            className="text-4xl md:text-5xl font-extrabold drop-shadow-lg mb-2"
            style={{ color: isDark ? '#fff' : '#222' }}
          >
            Paws & Claws Marketplace
          </h1>
          <p
            className="text-lg md:text-2xl font-medium drop-shadow"
            style={{ color: isDark ? '#e0e0e0' : '#444' }}
          >
            Final Year Project by the students of BUITEMS
          </p>
        </div>
      </section>
      

      {/* Project Description */}
      <Container maxWidth="md" sx={{ mb: 6 }}>
        <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 500 }}>
          About the Project
              </Typography>
              <Typography 
                variant="body1" 
          align="center"
                color="text.secondary"
          sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}
              >
          Paws & Claws Marketplace is a comprehensive platform designed for pet adoption and the responsible buying and selling of pets and pet products. The project aims to connect pet lovers, facilitate ethical adoptions, and provide a secure, user-friendly environment for all users. Developed as a Final Year Project for BUITEMS, it showcases modern web development practices and a passion for animal welfare.
              </Typography>
      </Container>

      {/* Developers Info Section */}
      <Container maxWidth="lg">
        {/* Centered Developed by heading */}
          <Typography 
          variant="h6"
            sx={{ 
            fontWeight: 600,
            mb: 1,
              textAlign: 'center', 
            letterSpacing: 1,
            fontSize: '1.3rem',
          }}
        >
          Developed by:
          </Typography>
                  <Box 
                    sx={{ 
                      display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 4,
            mt: 1,
          }}
        >
          {/* Left Column - Shahzain Khan */}
          <Box
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: { xs: 'center', md: 'flex-end' },
              textAlign: { xs: 'center', md: 'right' },
              pr: { md: 4 },
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Shahzain Khan
          </Typography>
            <Typography variant="body2">CMS ID: 57472</Typography>
            <Typography variant="body2">
              Email:{' '}
              <Typography 
                component="a"
                href="mailto:shazain816@gmail.com"
                sx={{ color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer' }}
              >
                shazain816@gmail.com
              </Typography>
              </Typography>
            <Typography variant="body2">Faculty: FICT</Typography>
            <Typography variant="body2">Department: Information Technology</Typography>
            <Typography variant="body2">Batch: 2021</Typography>
          </Box>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }} />
          <Divider orientation="horizontal" flexItem sx={{ display: { xs: 'block', md: 'none' }, my: 2 }} />

          {/* Right Column - Sohaib Sikandar */}
          <Box
          sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
              pl: { md: 4 },
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Sohaib Sikandar
            </Typography>
            <Typography variant="body2">CMS ID: 58306</Typography>
            <Typography variant="body2">
              Email:{' '}
            <Typography 
                component="a"
                href="mailto:sksohaib147@gmail.com"
                sx={{ color: theme.palette.primary.main, textDecoration: 'underline', cursor: 'pointer' }}
              >
                sksohaib147@gmail.com
              </Typography>
            </Typography>
            <Typography variant="body2">Faculty: FICT</Typography>
            <Typography variant="body2">Department: Information Technology</Typography>
            <Typography variant="body2">Batch: 2021</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default About; 