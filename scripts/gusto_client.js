import { Gusto } from 'gusto'
const gusto = new Gusto({
  companyAccessAuth: process.env['GUSTO_COMPANY_ACCESS_AUTH'] ?? '',
})
async function run() {
  const request = {}
  const result = await gusto.introspection.getInfo(request)
  // Handle the result
  console.log(result)
}
run()
