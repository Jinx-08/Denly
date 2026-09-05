const supabase = require('../supabase/client');
const validationResult = require('express-validator').validationResult;

const isUuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// Group counts by one column — fetches rows since head:true returns none
const groupCount = async (table, column) => {
    const { data, error } = await supabase.from(table).select(column);
    if (error) throw error;
    const grouped = {};
    for (const row of data) grouped[row[column]] = (grouped[row[column]] || 0) + 1;
    return grouped;
};

exports.getStatistics = async (req, res) => {
    try {
        const [petsByStatus, appsByStatus, apptsByType, partnersByType, totalPartners, totalResources, totalPets] =
            await Promise.all([
                groupCount('pets', 'status'),
                groupCount('adoption_applications', 'status'),
                groupCount('appointments', 'type'),
                groupCount('partners', 'type'),
                supabase.from('partners').select('id', { count: 'exact', head: true }).then((r) => r.count),
                supabase.from('resources').select('id', { count: 'exact', head: true }).then((r) => r.count),
                supabase.from('pets').select('id', { count: 'exact', head: true }).then((r) => r.count),
            ]);

        return res.status(200).json({
            statistics: {
                pets: {
                    total: totalPets,
                    byStatus: petsByStatus,
                },
                applications: {
                    total: Object.values(appsByStatus).reduce((a, b) => a + b, 0),
                    byStatus: appsByStatus,
                },
                appointments: {
                    total: Object.values(apptsByType).reduce((a, b) => a + b, 0),
                    byType: apptsByType,
                },
                partners: {
                    total: totalPartners,
                    byType: partnersByType,
                },
                resources: { total: totalResources },
            },
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Error fetching statistics' });
    }
};

exports.getPets = async (req, res) => {
    try {
        const { data: pets, error } = await supabase.from('pets')
        .select('id, name, breed, age_months, status, created_at, partner_id (name)')
        .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching pets:', error);
            return res.status(500).json({ error: 'Error fetching pets' });
        }
        return res.status(200).json({ pets });
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ error: 'Error fetching pets' });
    }
};

exports.getApplications = async (req, res) => {
    try {
        const { data: applications, error } = await supabase.from('adoption_applications')
        .select('id, status, created_at, pet_id (name), user_id (full_name, phone)')
        .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching applications:', error);
            return res.status(500).json({ error: 'Error fetching applications' });
        }
        return res.status(200).json({ applications });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Error fetching applications' });
    }
};

exports.getPartners = async (req, res) => {
    try {
        const { data: partners, error } = await supabase.from('partners')
        .select('id, name, type, address, city, phone, email, about, logo_url, owner_id (full_name)')
        .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching partners:', error);
            return res.status(500).json({ error: 'Error fetching partners' });
        }
        return res.status(200).json({ partners });
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: 'Error fetching partners' });
    }
};

exports.deletePets = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) {
        return res.status(400).json({ error: 'Invalid pet ID' });
    }
    try {
        // .select() returns the deleted rows, so the 404 check below actually works
        const { data, error } = await supabase.from('pets')
        .delete()
        .eq('id', id)
        .select();
        if (error) {
            console.error('Error deleting pet:', error);
            return res.status(500).json({ error: 'Error deleting pet' });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }
        return res.status(200).json({ message: 'Pet deleted successfully' });
    } catch (error) {
        console.error('Error deleting pet:', error);
        res.status(500).json({ error: 'Error deleting pet' });
    }
};

exports.deleteApplications = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) {
        return res.status(400).json({ error: 'Invalid application ID' });
    }
    try {
        const { data, error } = await supabase.from('adoption_applications')
        .delete()
        .eq('id', id)
        .select();
        if (error) {
            console.error('Error deleting application:', error);
            return res.status(500).json({ error: 'Error deleting application' });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        return res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Error deleting application' });
    }
};

exports.patchPartners = async (req, res) => {
      const { id } = req.params;
      if (!isUuid(id)) {
          return res.status(400).json({ error: 'Invalid partner ID' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      const { name, type, address, city, phone, email, about, logo_url } = req.body;
      try {
          // Build the update from only the fields actually provided
          const updates = {};
          for (const [key, value] of Object.entries({ name, type, address, city, phone, email,
  about, logo_url })) {
              if (value !== undefined && value !== null) updates[key] = value;
          }
          if (Object.keys(updates).length === 0) {
              return res.status(400).json({ error: 'No fields to update' });
          }

          const { data, error } = await supabase.from('partners')
              .update(updates)
              .eq('id', id)
              .select();
          if (error) {
              console.error('Error updating partner:', error);
              return res.status(500).json({ error: 'Error updating partner' });
          }
          if (data.length === 0) {
              return res.status(404).json({ error: 'Partner not found' });
          }
          return res.status(200).json({ message: 'Partner updated successfully', partner:
  data[0] });
      } catch (error) {
          console.error('Error updating partner:', error);
          res.status(500).json({ error: 'Error updating partner' });
      }
  };
