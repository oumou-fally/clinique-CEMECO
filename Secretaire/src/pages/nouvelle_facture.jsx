import { useState } from 'react'
import Layout from '../layouts/Layout'
import InvoiceList from './ComposantFacturation'
import InvoiceForm from './ComposantFormulaire'

export default function NouvelleFacure() {
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Formulaire nouvelle facture
  const [formData, setFormData] = useState({
    patient: '',
    service: '',
    amount: '',
    date: '',
    patientType: '',
    insuranceProvider: '',
    paymentMethod: '',
    bankName: '',
    bankAccountNumber: '',
    bankRIB: '',
    orangeNumber: '',
    orangeName: '',
    orangeTransactionId: ''
  })

  const [invoices, setInvoices] = useState([
    {
      id: 'FAC-001',
      patient: 'Jean Dupont',
      date: '25/03/2024',
      amount: 150.00,
      status: 'paid',
      service: 'Visite générale'
    },
    {
      id: 'FAC-002',
      patient: 'Marie Lefevre',
      date: '26/03/2024',
      amount: 200.00,
      status: 'pending',
      service: 'Consultation cardiologie'
    },
    {
      id: 'FAC-003',
      patient: 'Pierre Martin',
      date: '27/03/2024',
      amount: 120.00,
      status: 'paid',
      service: 'Visite de suivi'
    },
    {
      id: 'FAC-004',
      patient: 'Anne Durand',
      date: '28/03/2024',
      amount: 180.00,
      status: 'pending',
      service: 'Dermatologie'
    },
    {
      id: 'FAC-005',
      patient: 'Luc Bernard',
      date: '28/03/2024',
      amount: 250.00,
      status: 'overdue',
      service: 'Bilan complet'
    }
  ])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMarkPaidByBank = (invoiceId) => {
    setInvoices((currentInvoices) =>
      currentInvoices.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status: 'paid',
              paymentDetails: {
                ...invoice.paymentDetails,
                bankDeposit: `Dépôt simulé sur le compte bancaire de l'administrateur Elhadj Yaya Baldé.`
              }
            }
          : invoice
      )
    )
  }

  const handleAddInvoice = () => {
    const errors = []

    if (!formData.patient.trim()) errors.push('patient')
    if (!formData.service.trim()) errors.push('service')
    if (!formData.amount || Number(formData.amount) <= 0) errors.push('amount')
    if (!formData.date) errors.push('date')
    if (!formData.patientType) errors.push('patientType')
    if (formData.patientType !== 'insured' && !formData.paymentMethod) errors.push('paymentMethod')

    if (formData.patientType === 'insured') {
      if (!formData.insuranceProvider) errors.push('insuranceProvider')
    }

    if (formData.paymentMethod === 'banque') {
      if (!formData.bankName.trim()) errors.push('bankName')
      if (!formData.bankAccountNumber.trim()) errors.push('bankAccountNumber')
      if (!formData.bankRIB.trim()) errors.push('bankRIB')
    }
    if (formData.paymentMethod === 'orange-money') {
      if (!formData.orangeNumber.trim()) errors.push('orangeNumber')
      if (!formData.orangeName.trim()) errors.push('orangeName')
      if (!formData.orangeTransactionId.trim()) errors.push('orangeTransactionId')
    }

    if (errors.length > 0) {
      alert('Veuillez remplir tous les champs de facturation requis.')
      return
    }

    const newInvoice = {
      id: `FAC-${String(invoices.length + 1).padStart(3, '0')}`,
      patient: formData.patient,
      date: formData.date,
      amount: parseFloat(formData.amount),
      status: 'pending',
      service: formData.service,
      patientType: formData.patientType,
      insuranceProvider: formData.insuranceProvider,
      paymentMethod: formData.patientType === 'insured' ? 'assurance' : formData.paymentMethod,
      paymentDetails: formData.patientType === 'insured' ? {
        insuranceProvider: formData.insuranceProvider,
        adminAccount: 'Elhadj Yaya Baldé',
        note: `Facture envoyée à ${formData.insuranceProvider}. Dépôt attendu sur le compte bancaire de l'administrateur Elhadj Yaya Baldé.`
      } : formData.paymentMethod === 'banque' ? {
        bankName: formData.bankName,
        accountNumber: formData.bankAccountNumber,
        rib: formData.bankRIB
      } : {
        orangeNumber: formData.orangeNumber,
        orangeName: formData.orangeName,
        transactionId: formData.orangeTransactionId
      }
    }

    setInvoices([...invoices, newInvoice])
    setFormData({
      patient: '',
      service: '',
      amount: '',
      date: '',
      patientType: '',
      insuranceProvider: '',
      paymentMethod: '',
      bankName: '',
      bankAccountNumber: '',
      bankRIB: '',
      orangeNumber: '',
      orangeName: '',
      orangeTransactionId: ''
    })
    setShowModal(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({ 
      patient: '', 
      service: '', 
      amount: '', 
      date: '',
      patientType: '',
      insuranceProvider: '',
      paymentMethod: '',
      bankName: '',
      bankAccountNumber: '',
      bankRIB: '',
      orangeNumber: '',
      orangeName: '',
      orangeTransactionId: ''
    })
  }

  return (
    <Layout>
      <div className="p-6">
        <InvoiceList
          invoices={invoices}
          filter={filter}
          onFilterChange={setFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onNewInvoiceClick={() => setShowModal(true)}
          onMarkPaidByBank={handleMarkPaidByBank}
        />
        <InvoiceForm
          showModal={showModal}
          onClose={closeModal}
          formData={formData}
          onFormChange={handleFormChange}
          onAddInvoice={handleAddInvoice}
        />
      </div>
    </Layout>
  )
}
