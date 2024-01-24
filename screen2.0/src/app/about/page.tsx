"use client"
import React, { useRef, useState } from "react"
import emailjs from '@emailjs/browser';
import { Box, Button, Stack, TextField, Typography } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"

export default function About() {
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [error, setError] = useState({ name: false, email: false, message: false })
  const [success, setSuccess] = useState(false)

  const form = useRef();

  function isValidEmail(email) {
    //hopefully this is right, got it from ChatGPT
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  if (error.email && isValidEmail(contactEmail)) setError({ ...error, email: false })
  if (error.name && contactName) setError({ ...error, name: false })
  if (error.message && contactMessage) setError({ ...error, message: false })

  const handleSubmit = async () => {
    //Check fields to see if valid
    const newErrorState = { name: false, email: false, message: false }
    if (!contactName) newErrorState.name = true
    if (!isValidEmail(contactEmail)) newErrorState.email = true
    if (!contactMessage) newErrorState.message = true

    //If all fields valid: Try to send email and form fields, catch any error
    if (!newErrorState.name && !newErrorState.email && !newErrorState.message) {
      try {
        await sendEmail()
        setContactName('')
        setContactEmail('')
        setContactMessage('')
        setSuccess(true)
      } catch (error) {
        console.log(error)
        window.alert("Something went wrong, please try again soon" + '\n' + JSON.stringify(error))
      }
    }
    setError(newErrorState)
  }

  const sendEmail = () => {
    console.log(form.current);

    return new Promise((resolve, reject) => {
      emailjs.sendForm('service_xgqtw5g', 'SCREEN_contact_form', form.current, 'yIDe01Vwo_y6j_KtV')
        .then((result) => {
          console.log(result.text);
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return (
    <main>
      <Grid2 container spacing={4} sx={{ maxWidth: "70%", mr: "auto", ml: "auto", mt: "3rem" }}>
        <Grid2 xs={12} lg={6}>
          <Typography variant="h3">About SCREEN</Typography>
          <Typography variant="h5">Search Candidate cis-Regulatory Elements by ENCODE</Typography>
        </Grid2>
        <Grid2 xs={12} lg={8} id="contact-us">
          <Typography variant="h3">Contact Us</Typography>
          <Typography mb={1} variant="body1">Send us a message and we&apos;ll be in touch</Typography>
          <Typography mb={1} variant="body1">As this is a beta site, we would greatly appreciate any feedback you may have. Knowing how our users are using the site and documenting issues they may have are important to make this resource better and easier to use.</Typography>
          <Stack direction="row">
            <Typography mb={1} variant="body1">If you&apos;re experiencing an error/bug, feel free to&nbsp;</Typography>
            <a href="https://github.com/weng-lab/SCREEN2.0/issues"><u><Typography mb={1} color={"primary"} variant="body1">submit an issue on Github</Typography></u></a>
          </Stack>
          <Stack direction="row">
          <Typography mb={1} variant="body1">If you would like to send an attachment, feel free to email us directly at&nbsp;</Typography>
            <a href="mailto:encode-screen@googlegroups.com"><u><Typography mb={1} color={"primary"} variant="body1">encode-screen@googlegroups.com</Typography></u></a>
          </Stack>
          <Box
            component="form"
            ref={form}
            // onSubmit={(event) => handleSubmit(event)}
            id="contact-us"
            sx={{
              '& > :not(style)': { width: '50ch' },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              required
              value={contactName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setContactName(event.target.value);
              }}
              error={error.name}
              name="user_name"
              type="text"
              sx={{ display: 'block', mb: 1 }}
              id="outlined-basic"
              label="Name"
              variant="outlined"
            />
            <TextField
              required
              value={contactEmail}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setContactEmail(event.target.value);
              }}
              error={error.email || contactEmail !== '' && !isValidEmail(contactEmail)}
              helperText={error.email && "Please enter a valid email"}
              name="user_email"
              type="email"
              sx={{ display: 'block', mb: 1 }}
              id="outlined-basic"
              label="Email"
              variant="outlined"
            />
            <TextField
              required
              value={contactMessage}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setContactMessage(event.target.value);
              }}
              error={error.message}
              name="message"
              type="text"
              fullWidth
              rows={4}
              sx={{ display: 'block' }}
              multiline id="outlined-basic"
              label="Message"
              variant="outlined"
            />
            <Button
              sx={{ mt: 1 }}
              variant="contained"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
          {success && <Typography>Submitted successfully, thank you!</Typography>}
        </Grid2>
      </Grid2>
    </main>
  )
}