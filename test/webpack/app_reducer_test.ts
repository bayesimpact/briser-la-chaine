import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import {user} from 'store/app_reducer'

chai.use(chaiDatetime)


describe('user reducer', (): void => {
  describe('COMPUTE_CONTAGIOUS_PERIOD', (): void => {
    it('should compute a proper contagious period', (): void => {
      const newState = user(
        {symptomsOnsetDate: new Date('2020-05-19')},
        {type: 'COMPUTE_CONTAGIOUS_PERIOD'},
      )
      chai.expect(newState.symptomsOnsetDate).to.equalDate(new Date('2020-05-19'))
      chai.expect(newState.contagiousPeriodStart).to.equalDate(new Date('2020-05-17'))
      chai.expect(newState.contagiousPeriodEnd).to.equalDate(new Date('2020-05-27'))
    })
  })

  describe('SET_SYMPTOMS_ONSET_DATE', (): void => {
    it('should drop the contagious period', (): void => {
      const newState = user(
        {
          contagiousPeriodEnd: new Date('2020-05-27'),
          contagiousPeriodStart: new Date('2020-05-17'),
          symptomsOnsetDate: new Date('2020-05-19'),
        },
        {
          symptomsOnsetDate: new Date('2020-05-01'),
          type: 'SET_SYMPTOMS_ONSET_DATE',
        },
      )
      chai.expect(newState.symptomsOnsetDate).to.equalDate(new Date('2020-05-01'))
      chai.expect(newState.contagiousPeriodStart).to.be.undefined
      chai.expect(newState.contagiousPeriodEnd).to.be.undefined
    })
  })
})
