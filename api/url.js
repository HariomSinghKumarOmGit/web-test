export default function handler(req, res) {
  const target = req.query?.q;
  if (target) {
    return res.redirect(302, target);
  }
  return res.redirect(302, '/');
}
