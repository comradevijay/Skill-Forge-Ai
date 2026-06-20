import Contact from '../models/Contact.js';
import asyncHandler from '../utils/asyncHandler.js';

// @route   POST /api/contact
// @access  Public
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please fill out all fields');
  }

  const lead = await Contact.create({ name, email, subject, message });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been sent.',
    lead: { id: lead._id },
  });
});

// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = asyncHandler(async (req, res) => {
  const leads = await Contact.find().sort({ createdAt: -1 });
  res.json({ success: true, count: leads.length, leads });
});

// @route   PATCH /api/contact/:id
// @access  Private/Admin
export const updateContactStatus = asyncHandler(async (req, res) => {
  const lead = await Contact.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }
  lead.status = lead.status === 'new' ? 'read' : 'new';
  await lead.save();
  res.json({ success: true, lead });
});

// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContact = asyncHandler(async (req, res) => {
  const lead = await Contact.findByIdAndDelete(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }
  res.json({ success: true, message: 'Lead deleted' });
});
