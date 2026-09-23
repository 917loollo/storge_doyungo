export default async function handler(req, res) {
  const { gistId } = req.query;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "GITHUB_TOKEN 환경 변수가 설정되지 않았습니다." });
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const data = await response.json();
      
      if (data.files) {
        const firstKey = Object.keys(data.files)[0];
        if (firstKey && data.files[firstKey].content) {
          try {
            return res.status(200).json(JSON.parse(data.files[firstKey].content));
          } catch {
            return res.status(200).json([]);
          }
        }
      }
      return res.status(200).json([]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } 

  if (req.method === 'POST') {
    try {
      const filesArray = req.body;
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            'files.json': { content: JSON.stringify(filesArray, null, 2) }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Gist 업데이트에 실패했습니다.');
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).end();
}